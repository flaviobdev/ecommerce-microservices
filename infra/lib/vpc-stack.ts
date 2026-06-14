import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcStack extends cdk.Stack {
    readonly vpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        this.vpc = new ec2.Vpc(this, "EcommerceVPC", {
            vpcName: "EcommerceVPC",
            maxAzs: 2, // número máximo de zonas de disponibilidade para criar sub-redes, isso é importante para garantir alta disponibilidade e resiliência da aplicação, já que se uma zona de disponibilidade ficar indisponível, a aplicação ainda estará disponível em outra zona.
            // natGateways: 0, // economizar custos em ambiente de desenvolvimento, já que o NAT Gateway é cobrado por hora e por GB de dados transferidos, e em ambiente de desenvolvimento geralmente não é necessário ter acesso à internet para as instâncias dentro da VPC.
        });
    }
}