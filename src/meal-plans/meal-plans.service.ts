// src/meal-plans/meal-plans.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MealPlansService {
  constructor(private prisma: PrismaService) {}

  get(familyId: string, weekStart: Date) {
    return this.prisma.mealPlan.findFirst({ where: { familyId, weekStart } });
  }

  save(familyId: string, weekStart: Date, timezone: string | undefined, jsonPlan: unknown) {
    return this.prisma.mealPlan.upsert({
      where: { familyId_weekStart: { familyId, weekStart } },
      update: { timezone, jsonPlan },
      create: { familyId, weekStart, timezone, jsonPlan },
    } as any); // se o composite unique não tiver alias gerado, ajuste o nome
  }
}
