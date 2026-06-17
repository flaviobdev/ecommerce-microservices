import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { ProductException } from "./product.exception";
import { LoggerFactory } from "json-logger-service/dist/src/LoggerFactory";
import { JsonLogger } from "json-logger-service/dist/src/JsonLogger";
import { Request, Response } from "express";

@Catch(ProductException)
export class ProductExceptionFilter implements ExceptionFilter {
    catch(exception: ProductException, host: ArgumentsHost) {
        const logger: JsonLogger = LoggerFactory.createLogger(ProductExceptionFilter.name)

        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()
        const status = exception.getStatus()
        const requestId = request.headers['requestid']
        const traceId = request.headers['x-amzn-trace-id']
        const productId = exception.productId

        logger.error(
            {
                requestId: requestId,
                traceId: traceId,
                productId: productId
            }, exception.message
        )

        response.status(status)
        .json({
            statusCode: status,
            message: exception.message,
            requestId: requestId,
        })
    }

}