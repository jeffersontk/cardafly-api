// src/grocery/grocery.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GroceryController } from './grocery.controller';
import { GroceryService } from './grocery.service';

@Module({
  imports: [PrismaModule],
  controllers: [GroceryController],
  providers: [GroceryService],
})
export class GroceryModule {}
