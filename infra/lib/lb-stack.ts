import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface LoadBalancerStackProps extends cdk.StackProps {
    vpc: cdk.aws_ec2.Vpc;
}

export class LoadBalancerStack extends cdk.Stack {
    readonly networkLoadBalancer: cdk.aws_elasticloadbalancingv2.NetworkLoadBalancer;
    readonly loadBalancer: cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, props: LoadBalancerStackProps) {
        super(scope, id, props);
        const nlbSecurityGroup = new cdk.aws_ec2.SecurityGroup(this, 'NlbSecurityGroup', {
            vpc: props.vpc,
            allowAllOutbound: false,
            description: 'Security group for internal NLB',
        });

        nlbSecurityGroup.addIngressRule(
            cdk.aws_ec2.Peer.anyIpv4(),
            cdk.aws_ec2.Port.tcp(8080),
            'Allow API Gateway VPC Link access to internal NLB on port 8080'
        );

        nlbSecurityGroup.addEgressRule(
            cdk.aws_ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
            cdk.aws_ec2.Port.tcp(8080),
            'Allow NLB to reach ECS tasks on port 8080'
        );

        this.networkLoadBalancer = new cdk.aws_elasticloadbalancingv2.NetworkLoadBalancer(this, 'Nlb', {
            loadBalancerName: 'EcommerceNlb',
            vpc: props.vpc,
            internetFacing: false,
            securityGroups: [nlbSecurityGroup],
        });

        this.loadBalancer = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, 'Alb', {
            loadBalancerName: 'EcommerceAlb',
            vpc: props.vpc,
            internetFacing: false,
        });
    }
}