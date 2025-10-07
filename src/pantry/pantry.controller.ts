// src/pantry/pantry.controller.ts
import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PantryService } from './pantry.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';

type Unidade = 'g' | 'ml' | 'un';

@UseGuards(JwtAuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(private readonly service: PantryService) {}
  private familyId(req: Request) {
    return (req.user as any).activeFamilyId as string;
  }

  @Get()
  list(@Req() req: Request) {
    return this.service.list(this.familyId(req));
  }

  @Post()
  create(
    @Req() req: Request,
    @Body() body: { item: string; brand?: string; unidade: Unidade; quantidade: number },
  ) {
    return this.service.upsert(
      this.familyId(req),
      body.item,
      body.unidade,
      body.brand,
      undefined,
      Number(body.quantidade) || 0,
    );
  }

  @Patch()
  patch(
    @Req() req: Request,
    @Body()
    body: { item: string; brand?: string; unidade: Unidade; delta?: number; quantidade?: number },
  ) {
    return this.service.upsert(
      this.familyId(req),
      body.item,
      body.unidade,
      body.brand,
      typeof body.delta === 'number' ? body.delta : undefined,
      typeof body.quantidade === 'number' ? body.quantidade : undefined,
    );
  }

  @Delete()
  del(@Req() req: Request, @Body() body: { item: string; brand?: string; unidade: Unidade }) {
    return this.service.remove(this.familyId(req), body.item, body.unidade, body.brand);
  }
}
