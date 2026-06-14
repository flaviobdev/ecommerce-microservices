import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface ClusterStackProps extends cdk.StackProps {
    vpc: cdk.aws_ec2.Vpc;
}

export class ClusterStack extends cdk.Stack {
    readonly cluster: cdk.aws_ecs.Cluster;


    constructor(scope: Construct, id: string, props: ClusterStackProps) {
        super(scope, id, props);

        this.cluster = new cdk.aws_ecs.Cluster(this, "EcommerceCluster", {
            clusterName: "ECommerce", // nome do cluster, isso é importante para identificar o cluster na AWS e também para referenciar ele em outras partes do código, como na definição da task do ECS
            vpc: props.vpc, // a VPC onde o cluster será criado, isso é importante para garantir que os recursos do cluster estejam na mesma VPC e possam se comunicar entre si.
            containerInsights: true, // habilitar o Container Insights para coletar métricas e logs dos containers do cluster, isso é útil para monitorar a performance e identificar problemas na aplicação.
        });
    }
}