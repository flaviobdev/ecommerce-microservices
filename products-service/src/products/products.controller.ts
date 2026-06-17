import { Body, Controller, Delete, Get, Headers, Param, Post, Put } from '@nestjs/common';
import { Product } from './interfaces/product.interface';
import { ProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';
import { JsonLogger, LoggerFactory } from 'json-logger-service';


@Controller('api/products')
export class ProductsController {
    private readonly logger: JsonLogger = LoggerFactory.createLogger(ProductsController.name);

    constructor(private productsService: ProductsService) {}

    @Get()
    async getAllProducts(@Headers() headers): Promise<ProductDto[]> {
        this.logger.info({
            requestId: headers['requestId'],
            traceId: headers['x-amzn-trace-id'],
        }, 'Received request to get all products');
        const product = await this.productsService.findAll()
        return product.map(this.productToProductDto) // aqui a gente converte o Product para ProductDto, isso é importante para não expor detalhes do nosso modelo de dados que não são relevantes para o cliente
    }

    @Get(':id')
    async getById(@Param('id') id: string, @Headers() headers): Promise<ProductDto> {
        this.logger.info({
            requestId: headers['requestId'],
            traceId: headers['x-amzn-trace-id'],
        }, 'Received request to get product by ID');
        return this.productToProductDto(await this.productsService.findOne({id: id}))
    }

    @Post()
    async create(@Body() productDto: ProductDto, @Headers() headers): Promise<ProductDto> {
        this.logger.info({
            requestId: headers['requestId'],
            traceId: headers['x-amzn-trace-id'],
        }, 'Received request to create product');
        return this.productToProductDto(
            await this.productsService.create(this.productDtoToProduct(productDto))
        )
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Headers() headers): Promise<ProductDto> {
        this.logger.info({
            requestId: headers['requestId'],
            traceId: headers['x-amzn-trace-id'],
        }, 'Received request to delete product');
        return this.productToProductDto(await this.productsService.delete({id: id}))

    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() productDto: ProductDto, @Headers() headers): Promise<ProductDto> {
        this.logger.info({
            requestId: headers['requestId'],
            traceId: headers['x-amzn-trace-id'],
        }, 'Received request to update product');
        return this.productToProductDto(
            await this.productsService.update({id: id}, this.productDtoToProduct(productDto))
        )
    }

    private productToProductDto(product: Product): ProductDto {
        return {
            id: product.id,
            name: product.productName,
            code: product.code,
            price: product.price,
            model: product.model,
            url: product.productUrl
        }
    }

    private productDtoToProduct(productDto: ProductDto): Product {
        return {
            id: productDto.id,
            productName: productDto.name,
            code: productDto.code,
            price: productDto.price,
            model: productDto.model,
            productUrl: productDto.url
        }
    }
}
