// src/pantry/pantry.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { PantryService } from './pantry.service';

type Unidade = 'g' | 'ml' | 'un';
type SingleBody = { item: string; unidade: Unidade; quantidade?: number; brand?: string };
type BulkBody = Array<SingleBody & { familyId?: string }>;

@UseGuards(JwtAuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(private readonly service: PantryService) {}

  private familyId(req: Request) {
    // o JWT guard popula user; usamos a família ativa
    return (req.user as any).activeFamilyId as string;
  }

  @Get()
  list(@Req() req: Request) {
    return this.service.list(this.familyId(req));
  }

  @Post()
  @HttpCode(201)
  async createOrBulk(@Req() req: Request, @Body() body: SingleBody | BulkBody) {
    const fid = this.familyId(req);

    // bulk
    if (Array.isArray(body)) {
      if (body.length === 0) throw new BadRequestException('items required');
      // garante familyId e normaliza campos
      const items = body.map((i) => ({
        familyId: i.familyId ?? fid,
        item: i.item,
        unidade: i.unidade,
        brand: i.brand,
        quantidade: i.quantidade,
      }));
      return this.service.upsertMany(items, fid);
    }

    // single
    return this.service.upsert(
      fid,
      body.item,
      body.unidade,
      body.brand ?? null,
      undefined,
      Number(body.quantidade) || 0,
    );
  }

  @Patch()
  async patch(
  @Req() req: Request,
  @Body() body: SingleBody | BulkBody,
  ) {
    const fid = this.familyId(req);

    // 🔁 Bulk (array): usa upsertMany e retorna array (o teste espera isso)
    if (Array.isArray(body)) {
      if (body.length === 0) throw new BadRequestException('items required');
      const items = body.map((i) => ({
        familyId: i.familyId ?? fid,
        item: i.item,
        unidade: i.unidade,
        brand: i.brand ?? null,
        // o teste envia `quantidade` (não `delta`)
        quantidade: typeof i.quantidade === 'number' ? i.quantidade : undefined,
        delta: undefined,
      }));
      return this.service.upsertMany(items, fid);
    }

    // ✅ Single
    return this.service.upsert(
      fid,
      body.item,
      body.unidade,
      body.brand ?? null,
      typeof (body as any).delta === 'number' ? (body as any).delta : undefined,
      typeof body.quantidade === 'number' ? body.quantidade : undefined,
    );
  }

  @Delete()
  async del(@Req() req: Request, @Body() body: SingleBody | BulkBody) {
    const fid = this.familyId(req);
    if (Array.isArray(body)) {
      if (body.length === 0) throw new BadRequestException('items required');
      const items = body.map((i) => ({
        familyId: i.familyId ?? fid,
        item: i.item,
        unidade: i.unidade,
        brand: i.brand ?? null,
      }));
      return this.service.removeMany(items, fid);
    }
    return this.service.remove(fid, body.item, body.unidade, body.brand ?? null);
  }
}
