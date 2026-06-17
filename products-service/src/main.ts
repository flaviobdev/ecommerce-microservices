import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as AWSXray from 'aws-xray-sdk';
import { JsonLoggerService, LoggerFactory } from 'json-logger-service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(AWSXray.express.openSegment(process.env.AWS_XRAY_TRACING_NAME || 'products-service'));

  AWSXray.config([
    AWSXray.plugins.ECSPlugin,
  ])
  AWSXray.captureHTTPsGlobal(require('http'));
  app.use(AWSXray.express.closeSegment());


  LoggerFactory.setDefaultLogCustomContextBuilder({
    buildCustomContext(): any {
      return {
        pid: undefined, // O PID não está disponível no ambiente do ECS, então deixamos como undefined ou podemos usar outro identificador se necessário
        host: undefined, // O host também pode ser indefinido ou podemos usar outro identificador se necessário
      }
    }
  })
  
  app.useLogger(new JsonLoggerService('ProductsService'));

  await app.listen(8080);
}
bootstrap();
