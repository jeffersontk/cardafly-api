import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfig } from '@nestjs/config';
import { envSchema } from './env.validation';

@Global()
@Module({
  imports: [
    NestConfig.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
  ],
})
export class ConfigModule {}
