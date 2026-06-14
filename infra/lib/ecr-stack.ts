import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class EcrStack extends cdk.Stack {
    readonly productsServiceRepository: cdk.aws_ecr.Repository;

    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        this.productsServiceRepository = new cdk.aws_ecr.Repository(this, "ProductsService", {
            repositoryName: "products-service", // nome do repositório, isso é importante para identificar o repositório na AWS e também para referenciar ele em outras partes do código, como na definição da task do ECS.
            imageTagMutability: cdk.aws_ecr.TagMutability.IMMUTABLE, // não posso subir imagem com a mesma tag, tem que ser uma nova tag para cada nova imagem, isso é uma boa prática para evitar problemas de cache e garantir que a imagem correta seja usada.
            emptyOnDelete: true, // quando a stack for deletada, o repositório e todas as imagens dentro dele serão deletados, isso é útil para evitar deixar recursos órfãos na AWS e também para economizar custos, já que o ECR cobra por armazenamento de imagens.
            removalPolicy: cdk.RemovalPolicy.DESTROY, // quando a stack for deletada, o repositório e todas as imagens dentro dele serão deletados, isso é útil para evitar deixar recursos órfãos na AWS e também para economizar custos, já que o ECR cobra por armazenamento de imagens.
        })
    }
}