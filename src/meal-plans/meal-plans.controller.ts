// src/meal-plans/meal-plans.controller.ts
import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';

import { Request } from 'express';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('meal-plans')
export class MealPlansController {
  constructor(private service: MealPlansService) {}
  private familyId(req: Request) {
    return (req.user as any).activeFamilyId as string;
  }

  @Get()
  get(@Req() req: Request, @Query('weekStart') weekStart: string) {
    return this.service.get(this.familyId(req), new Date(weekStart));
  }

  @Post()
  save(
    @Req() req: Request,
    @Body() body: { weekStart: string; timezone?: string; jsonPlan: unknown },
  ) {
    return this.service.save(
      this.familyId(req),
      new Date(body.weekStart),
      body.timezone,
      body.jsonPlan,
    );
  }
}
