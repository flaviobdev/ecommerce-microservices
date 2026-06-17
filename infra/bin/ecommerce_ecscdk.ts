#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { EcrStack } from '../lib/ecr-stack';
import { VpcStack } from '../lib/vpc-stack';
import { ClusterStack } from '../lib/cluster-stack';
import { LoadBalancerStack } from '../lib/lb-stack';
import { ProductsServiceStack } from '../lib/productsService-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();


//vou fazer deploy nessa conta aqui 
const env: cdk.Environment = {
  account: "751871643799",
  region: "us-east-1"
}

const tagsInfra = {
  cost: "EcommerceInfra",
  team: "devops"
}

const ecrStack = new EcrStack(app, 'Ecr', {
  env: env,
  tags: tagsInfra
});

const vpcStack = new VpcStack(app, 'Vpc', {
  env: env,
  tags: tagsInfra
});

const lbStack = new LoadBalancerStack(app, 'LoadBalancer', {
  env: env,
  tags: tagsInfra,
  vpc: vpcStack.vpc
});
lbStack.addDependency(vpcStack, "LoadBalancer depende da VPC para ser criado, então a VPC tem que ser criada antes do LoadBalancer");


const clusterStack = new ClusterStack(app, 'Cluster', {
  env: env,
  tags: tagsInfra,
  vpc: vpcStack.vpc
});
clusterStack.addDependency(vpcStack, "Cluster depende da VPC para ser criada, então a VPC tem que ser criada antes do Cluster");

const tagsproductsService = {
  cost: "ProductsService",
  team: "devops"
}

const productsServiceStack = new ProductsServiceStack(app, 'ProductsService', {
  vpc: vpcStack.vpc,
  cluster: clusterStack.cluster,
  nlb: lbStack.networkLoadBalancer,
  alb: lbStack.loadBalancer,
  repository: ecrStack.productsServiceRepository,
  env: env,
  tags: tagsproductsService,
});
productsServiceStack.addDependency(lbStack, "ProductsService depende do LoadBalancer para ser criado, então o LoadBalancer tem que ser criado antes do ProductsService");
productsServiceStack.addDependency(clusterStack, "ProductsService depende do Cluster para ser criado, então o Cluster tem que ser criado antes do ProductsService");
productsServiceStack.addDependency(vpcStack, "ProductsService depende da VPC para ser criado, então a VPC tem que ser criada antes do ProductsService");
productsServiceStack.addDependency(ecrStack, "ProductsService depende do ECR para ser criado, então o ECR tem que ser criado antes do ProductsService");

const apiStack = new ApiStack(app, 'Api', {
  env: env,
  tags: tagsInfra,
  nlb: lbStack.networkLoadBalancer
})
apiStack.addDependency(lbStack, "Api depende do LoadBalancer para ser criado, então o LoadBalancer tem que ser criado antes do Api");
apiStack.addDependency(productsServiceStack, "Api depende do ProductsService para ser criado, então o ProductsService tem que ser criado antes do Api");