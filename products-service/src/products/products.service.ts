import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
    private tableName: string
    private ddbDocClient: DynamoDBDocumentClient

    constructor() {
        this.tableName = process.env.PRODUCTS_DDB!
        this.ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))
    }
}
