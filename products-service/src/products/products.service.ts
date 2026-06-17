import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Product, ProductKey } from './interfaces/product.interface';
import { v4 as uuid } from 'uuid';
import {  captureAWSv3Client } from 'aws-xray-sdk';

@Injectable()
export class ProductsService {
    private tableName: string
    private ddbDocClient: DynamoDBDocumentClient

    constructor() {
        this.tableName = process.env.PRODUCTS_DDB!
        const ddbClient = captureAWSv3Client(new DynamoDBClient({})) // o captureAWSv3Client é necessário para que as chamadas ao DynamoDB sejam capturadas pelo X-Ray
        this.ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
    }

    async findAll(): Promise<Product[]> {
        //TODO - nunca usar scan em produção, isso é só para exemplo
        const command = new ScanCommand({
            TableName: this.tableName
        })

        const data = await this.ddbDocClient.send(command)
        return data.Items as Product[]
    }

    async findOne(key: ProductKey): Promise<Product> {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: key
        })
        const data = await this.ddbDocClient.send(command)

        if (data.Item) {
            return data.Item as Product
        } else {
            throw new HttpException("Product not found", HttpStatus.NOT_FOUND)
        }

    }

    async create(product: Product): Promise<Product> {
        product.id = uuid()

        const command = new PutCommand({
            TableName: this.tableName,
            Item: product
        })

        await this.ddbDocClient.send(command)
        return product
    }

    async delete(key: ProductKey): Promise<Product> {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: key,
            ReturnValues: "ALL_OLD"
        })

        const data = await this.ddbDocClient.send(command)

        if (data.Attributes) {
            return data.Attributes as Product
        } else {
            throw new HttpException("Product not found", HttpStatus.NOT_FOUND)
        }

    }

    async update(key: ProductKey, product: Product): Promise<Product> {
        try {
            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: key,
                UpdateExpression: "set productName = :productName, code = :code, price = :price, model = :model, productUrl = :productUrl",
                ExpressionAttributeValues: {
                    ":productName": product.productName,
                    ":code": product.code,
                    ":price": product.price,
                    ":model": product.model,
                    ":productUrl": product.productUrl
                },
                ReturnValues: "UPDATED_NEW",
                ConditionExpression: 'attribute_exists(id)' // isso garante que o produto exista antes de tentar atualizar, caso contrário lança um erro
            })

            const data = await this.ddbDocClient.send(command)

            data.Attributes!.id = key.id! // o id não é atualizado, mas queremos retornar ele junto com os outros atributos
            return data.Attributes as Product
        } catch (ConditionCheckFailedException) {
            throw new HttpException("Product not found", HttpStatus.NOT_FOUND)
        }
    }
}
