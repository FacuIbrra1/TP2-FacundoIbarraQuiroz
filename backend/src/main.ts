import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Descarta los campos que no están en el DTO.
      forbidNonWhitelisted: true, // En lugar de descartarlos, rechaza la petición con un 400.
      transform: true, // Convierte el body en una instancia del DTO.
    }),
  );
  // Deja que el front de Angular (que corre en otro puerto u otro dominio) llame a este back.
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
