import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface ProductsServiceStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
    cluster: ecs.Cluster;
    nlb: elbv2.NetworkLoadBalancer;
    alb: elbv2.ApplicationLoadBalancer;
    repository: ecr.Repository;
}

export class ProductsServiceStack extends cdk.Stack {
    readonly productsServiceRepository: ecr.Repository;

    constructor(scope: Construct, id: string, props: ProductsServiceStackProps) {
        super(scope, id, props);

        const productsDdb = new dynamodb.Table(this, "ProductsDdb", {
            tableName: "products",
            removalPolicy: cdk.RemovalPolicy.DESTROY, //padrao retain em prod
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1
        })



        const taskDefinition = new ecs.FargateTaskDefinition(this, 'ProductsServiceTaskDef', {
            memoryLimitMiB: 1024,
            cpu: 512,
            family: 'products-service',
        });
        productsDdb.grantReadWriteData(taskDefinition.taskRole); // Permite que a task acesse a tabela DynamoDB
        taskDefinition.taskRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXrayWriteOnlyAccess')); // Permite que a task envie dados para o X-Ray

        const logDriver = new ecs.AwsLogDriver({
            logGroup: new logs.LogGroup(this, 'LogGroup', {
                logGroupName: 'ProductsService',
                removalPolicy: cdk.RemovalPolicy.DESTROY,
                retention: logs.RetentionDays.ONE_WEEK
            }),
            streamPrefix: 'ProductsService',
        });

        taskDefinition.addContainer('ProductsServiceContainer', {
            image: ecs.ContainerImage.fromEcrRepository(props.repository, '1.1.1'),
            containerName: 'productsService',
            logging: logDriver,
            portMappings: [{
                containerPort: 8080,
                protocol: ecs.Protocol.TCP,
            }],
            cpu: 384,
            memoryLimitMiB: 896,
            environment: {
                PRODUCTS_DDB: productsDdb.tableName,
                AWS_XRAY_TRACING_NAME: 'products-service',
                AWS_XRAY_DAEMON_ADDRESS: '0.0.0.0:2000', // Configura o endereço do X-Ray Daemon para que as chamadas sejam capturadas
                AWS_XRAY_CONTEXT_MISSING: 'IGNORE_ERROR', // Configura o comportamento quando o contexto do X-Ray estiver ausente (opcional, dependendo do seu caso de uso)
                LOGGER_LEVEL: 'INFO', // Configura o nível de log para a aplicação, se necessário
            }
        });

        taskDefinition.addContainer('xray', {
            image: ecs.ContainerImage.fromRegistry('public.ecr.aws/xray/aws-xray-daemon:latest'),
            containerName: 'XrayProductsService',
            logging: ecs.LogDrivers.awsLogs({
                logGroup: new logs.LogGroup(this, 'XrayLogGroup', {
                    logGroupName: 'XrayProductsService',
                    removalPolicy: cdk.RemovalPolicy.DESTROY,
                    retention: logs.RetentionDays.ONE_WEEK
                }),
                streamPrefix: 'XrayProductsService',
            }),
            cpu: 128,
            memoryLimitMiB: 128,
            portMappings: [{
                containerPort: 2000,
                protocol: ecs.Protocol.UDP,
            }],
        })

        const service = new ecs.FargateService(this, 'ProductsService', {
            serviceName: 'ProductsService',
            cluster: props.cluster,
            taskDefinition: taskDefinition,
            desiredCount: 2
        });

        props.repository.grantPull(taskDefinition.taskRole);

        /**
         * Libera o ECS Service para receber tráfego na porta 8080
         * vindo de dentro da VPC.
         *
         * Isso evita dependência direta entre o Security Group do NLB
         * e o Security Group do Service, evitando DependencyCycle.
         */
        service.connections.securityGroups[0].addIngressRule(
            ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
            ec2.Port.tcp(8080),
            'Allow VPC traffic to products service on port 8080'
        );

        props.nlb.connections.allowFrom(
            ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
            ec2.Port.tcp(8080),
            'Allow VPC traffic to NLB on port 8080'
        );

        const albListener = props.alb.addListener('ProductsServiceAlbListener', {
            port: 8080,
            protocol: elbv2.ApplicationProtocol.HTTP,
            open: true
        });

        albListener.addTargets('ProductsServiceTarget', {
            targetGroupName: 'productsServiceAlb',
            port: 8080,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [service],
            deregistrationDelay: cdk.Duration.seconds(30),
            healthCheck: {
                interval: cdk.Duration.seconds(30),
                enabled: true,
                port: '8080',
                timeout: cdk.Duration.seconds(10),
                path: '/health',
            }
        });

        const nlbListener = props.nlb.addListener('ProductsServiceNlbListener', {
            port: 8080,
            protocol: elbv2.Protocol.TCP,
        });

        nlbListener.addTargets('ProductsServiceNlbTarget', {
            port: 8080,
            targetGroupName: 'productsServiceNlb',
            protocol: elbv2.Protocol.TCP,
            targets: [
                service.loadBalancerTarget({
                    containerName: 'productsService',
                    containerPort: 8080,
                    protocol: ecs.Protocol.TCP,
                })
            ],
            healthCheck: {
                enabled: true,
                protocol: elbv2.Protocol.TCP,
                port: '8080',
            }
        });
    }
}