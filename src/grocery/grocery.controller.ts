// src/grocery/grocery.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { GroceryService } from './grocery.service';
import {
  CreateGroceryListDto,
  PatchGroceryListDto,
  GroceryListItemInput,
  PatchGroceryListItemDto,
} from './dto/create-grocery-list.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('grocery')
export class GroceryController {
  constructor(private service: GroceryService) {}

  private activeFamilyId(req: Request) {
    return (req as any).user?.activeFamilyId as string;
  }

  // GET /api/grocery?weekStart=YYYY-MM-DD
  @Get()
  getForWeek(@Req() req: Request, @Query('weekStart') weekStart: string) {
    const familyId = this.activeFamilyId(req);
    return this.service.getForWeek(familyId, weekStart);
  }

  // PUT /api/grocery
  @Put()
  upsertForWeek(
    @Req() req: Request,
    @Body()
    body: {
      weekStart: string; // YYYY-MM-DD
      items: Array<{
        name: string;
        brand?: string;
        unidade: 'un' | 'g' | 'ml';
        quantidade: number;
      }>;
    },
  ) {
    const familyId = this.activeFamilyId(req);
    return this.service.upsertForWeek(familyId, body.weekStart, body.items);
  }

  private familyId(req: Request) {
    return (req.user as any).activeFamilyId as string;
  }

  @Get('lists')
  findAll(@Req() req: Request) {
    return this.service.findAll(this.familyId(req));
  }

  @Get('lists/:id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.service.findOne(this.familyId(req), id);
  }

  @Post('lists')
  create(@Req() req: Request, @Body() dto: CreateGroceryListDto) {
    return this.service.create(this.familyId(req), dto);
  }

  @Patch('lists/:id')
  patchList(@Req() req: Request, @Param('id') id: string, @Body() dto: PatchGroceryListDto) {
    return this.service.patchList(this.familyId(req), id, dto);
  }

  @Post('lists/:id/items')
  addItem(@Req() req: Request, @Param('id') id: string, @Body() item: GroceryListItemInput) {
    return this.service.addItem(this.familyId(req), id, item);
  }

  @Patch('lists/:id/items/:itemId')
  patchItem(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: PatchGroceryListItemDto,
  ) {
    return this.service.patchItem(this.familyId(req), id, itemId, dto);
  }

  @Delete('lists/:id/items/:itemId')
  removeItem(@Req() req: Request, @Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(this.familyId(req), id, itemId);
  }
}
