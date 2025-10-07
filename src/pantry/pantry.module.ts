// src/pantry/pantry.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';

@Module({
  imports: [PrismaModule],
  controllers: [PantryController],
  providers: [PantryService],
})
export class PantryModule {}
