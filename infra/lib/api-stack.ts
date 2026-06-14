import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

interface ApiStackProps extends cdk.StackProps {
    nlb: elbv2.NetworkLoadBalancer;
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const vpcLink = new apigateway.VpcLink(this, 'VpcLink', {
            targets: [props.nlb]
        })

        const restApi = new apigateway.RestApi(this, 'ProductsApi', {
            restApiName: 'EcommerceAPI',
        })
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
            }
        }))

        productsResource.addMethod("POST", new apigateway.Integration({
            type: apigateway.IntegrationType.HTTP_PROXY,
            integrationHttpMethod: "POST",
            uri: `http://${props.nlb.loadBalancerDnsName}:8080/api/products`,
            options: {
                vpcLink: vpcLink,
                connectionType: apigateway.ConnectionType.VPC_LINK,
            }
        }))


        const productIdResource = productsResource.addResource("{id}");
        const productIdIntegrationParameters = {
            "integration.request.path.id": "method.request.path.id"
        } // Mapeia o parâmetro de caminho "id" da solicitação para o parâmetro de caminho esperado pela integração (NLB)
        const productIdMethodParameters = {
            "method.request.path.id": true
        } // Exige que o parâmetro de caminho "id" seja fornecido na solicitação para este método

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