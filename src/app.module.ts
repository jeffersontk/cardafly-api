// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FamiliesModule } from './families/families.module';
import { PantryModule } from './pantry/pantry.module';
import { GroceryModule } from './grocery/grocery.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { MembersModule } from './members/members.module';
import { ShoppingModule } from './shopping/shopping.module';
import { InvitationsModule } from './invitations/invitations.module';

import * as Joi from 'joi';

@Module({
  imports: [
   ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().min(16).required(),
        DATABASE_URL: Joi.string().uri().required(),
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('production'),
        PORT: Joi.number().default(3000),
      }),
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    FamiliesModule,
    MembersModule,
    PantryModule,
    GroceryModule,
    MealPlansModule,
    NutritionModule,
    ShoppingModule,
    InvitationsModule,
  ],
})
export class AppModule {}
