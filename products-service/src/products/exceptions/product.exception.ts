import { HttpException } from "@nestjs/common";

export class ProductException extends HttpException {
    readonly productId?: string

    constructor(message: string, statusCode: number, productId?: string) {
        super(message, statusCode)
        this.productId = productId
    }
}