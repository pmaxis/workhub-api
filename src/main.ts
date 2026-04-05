import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { PrismaExceptionFilter } from '@/common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  const port = config.getOrThrow<number>('app.port');
  const cookieSecret = config.getOrThrow<string>('cookie.secret');
  const corsOrigins = config.getOrThrow<string[]>('cors.origins');

  app.set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser(cookieSecret));

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': [`'self'`, `'unsafe-inline'`],
          'style-src': [`'self'`, `'unsafe-inline'`],
        },
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Workhub API')
    .setDescription('REST API documentation')
    .setVersion('1')
    .addTag('Auth', 'Login, registration, token refresh (cookies), and logout.')
    .addTag('Sessions', 'Current user session list and revocation.')
    .addTag('Profile', 'Authenticated user profile read/update.')
    .addTag(
      'Users',
      'User accounts: CRUD and role assignment. Requires JWT and CASL policies (Create/Read/Update/Delete User, Manage UserRole).',
    )
    .addTag('Roles', 'Role catalog, CRUD, and role–permission links.')
    .addTag('Permissions', 'Permission catalog and CRUD.')
    .addTag('Companies', 'Companies visible to the user; create/update/delete with CASL.')
    .addTag('Projects', 'Projects with pagination and CASL-scoped access.')
    .addTag('Tasks', 'Tasks scoped by project and CASL.')
    .addTag(
      'Invitations',
      'Company/workspace invitations; public token lookup without JWT; other routes require auth and policies.',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();

  const swaggerDocumentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocumentFactory);

  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(),
  );

  await app.listen(port);
}

void bootstrap();
