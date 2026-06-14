import { Controller, Get } from '@nestjs/common';

@Controller('api/products')
export class ProductsController {

    @Get()
    getAllProducts(): string {
        console.info('Received request to get all products');
        return 'Hello, World!';
    }
}
