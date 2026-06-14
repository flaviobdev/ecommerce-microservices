import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Product } from './interfaces/product.interface';
import { ProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {

    constructor(private productsService: ProductsService) {}

    @Get()
    async getAllProducts(): Promise<ProductDto[]> {
        const product = await this.productsService.findAll()
        return product.map(this.productToProductDto) // aqui a gente converte o Product para ProductDto, isso é importante para não expor detalhes do nosso modelo de dados que não são relevantes para o cliente
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<ProductDto> {
        return this.productToProductDto(await this.productsService.findOne({id: id}))
    }

    @Post()
    async create(@Body() productDto: ProductDto): Promise<ProductDto> {
        return this.productToProductDto(
            await this.productsService.create(this.productDtoToProduct(productDto))
        )
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<ProductDto> {
        return this.productToProductDto(await this.productsService.delete({id: id}))

    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() productDto: ProductDto): Promise<ProductDto> {
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
            model: product.model
        }
    }

    private productDtoToProduct(productDto: ProductDto): Product {
        return {
            id: productDto.id,
            productName: productDto.name,
            code: productDto.code,
            price: productDto.price,
            model: productDto.model
        }
    }
}
