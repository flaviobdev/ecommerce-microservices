import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';

interface ApiStackProps extends cdk.StackProps {
    nlb: elbv2.NetworkLoadBalancer;
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const vpcLink = new apigateway.VpcLink(this, 'VpcLink', {
            targets: [props.nlb]
        })

        const apiGatewayCloudWatchRole = new iam.Role(this, 'ApiGatewayCloudWatchRole', {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AmazonAPIGatewayPushToCloudWatchLogs'
                )
            ]
        });

        const cfnAccount = new apigateway.CfnAccount(this, 'ApiGatewayAccount', {
            cloudWatchRoleArn: apiGatewayCloudWatchRole.roleArn
        });

        const logGroup = new logs.LogGroup(this, "EcommerceoApiLogs", {
            logGroupName: "EcommerceAPI",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.ONE_WEEK
        })

        const restApi = new apigateway.RestApi(this, 'ProductsApi', {
            restApiName: 'EcommerceAPI',
            deployOptions: {
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                    caller: true,
                    httpMethod: true,
                    ip: true,
                    requestTime: true,
                    resourcePath: true,
                    responseLength: true,
                    status: true,
                    user: true,
                    protocol: true,
                })
            }
        })

        restApi.node.addDependency(cfnAccount);


        this.createProductsResource(restApi, vpcLink, props);
    }

    private createProductsResource(
        restApi: apigateway.RestApi,
        vpcLink: apigateway.VpcLink,
        props: ApiStackProps) {
        const productsResource = restApi.root.addResource('products');

        productsResource.addMethod("GET", new apigateway.Integration({
            type: apigateway.IntegrationType.HTTP_PROXY,
            integrationHttpMethod: "GET",
            uri: `http://${props.nlb.loadBalancerDnsName}:8080/api/products`,
            options: {
                vpcLink: vpcLink,
                connectionType: apigateway.ConnectionType.VPC_LINK,
                requestParameters: {
                    "integration.request.header.requestId": "context.requestId"
                }
            }
        }), {
            requestParameters: {
                "method.request.header.requestId": false
            }
        })

        productsResource.addMethod("POST", new apigateway.Integration({
            type: apigateway.IntegrationType.HTTP_PROXY,
            integrationHttpMethod: "POST",
            uri: `http://${props.nlb.loadBalancerDnsName}:8080/api/products`,
            options: {
                vpcLink: vpcLink,
                connectionType: apigateway.ConnectionType.VPC_LINK,
                requestParameters: {
                    "integration.request.header.requestId": "context.requestId"
                }
            }
        }))


        const productIdResource = productsResource.addResource("{id}");
        const productIdIntegrationParameters = {
            "integration.request.path.id": "method.request.path.id",
            "integration.request.header.requestId": "context.requestId"
        } 
        const productIdMethodParameters = {
            "method.request.path.id": true,
            "method.request.header.requestId": false
        } 

        productIdResource.addMethod("GET", new apigateway.Integration({
            type: apigateway.IntegrationType.HTTP_PROXY,
            integrationHttpMethod: "GET",
            uri: `http://${props.nlb.loadBalancerDnsName}:8080/api/products/{id}`,
            options: {
                vpcLink: vpcLink,
                connectionType: apigateway.ConnectionType.VPC_LINK,
                requestParameters: productIdIntegrationParameters
            }
        }), {
            requestParameters: productIdMethodParameters
        })

        productIdResource.addMethod("PUT", new apigateway.Integration({
            type: apigateway.IntegrationType.HTTP_PROXY,
            integrationHttpMethod: "PUT",
            uri: `http://${props.nlb.loadBalancerDnsName}:8080/api/products/{id}`,
            options: {
                vpcLink: vpcLink,
                connectionType: apigateway.ConnectionType.VPC_LINK,
                requestParameters: productIdIntegrationParameters
            }
        }), {
            requestParameters: productIdMethodParameters
        })

        productIdResource.addMethod("DELETE", new apigateway.Integration({
            type: apigateway.IntegrationType.HTTP_PROXY,
            integrationHttpMethod: "DELETE",
            uri: `http://${props.nlb.loadBalancerDnsName}:8080/api/products/{id}`,
            options: {
                vpcLink: vpcLink,
                connectionType: apigateway.ConnectionType.VPC_LINK,
                requestParameters: productIdIntegrationParameters
            }
        }), {
            requestParameters: productIdMethodParameters
        })
    }
}