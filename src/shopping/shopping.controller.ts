// src/shopping/shopping.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { ShoppingService } from './shopping.service';
import { Request } from 'express';
import { CloseTripDto, PatchTripItemsDto, StartTripDto } from './dto/shopping.dto';

@UseGuards(JwtAuthGuard)
@Controller('shopping')
export class ShoppingController {
  constructor(private service: ShoppingService) {}
  private familyId(req: Request) {
    return (req.user as any).activeFamilyId as string;
  }
  private userId(req: Request) {
    return (req.user as any).sub as string;
  }

  @Post('trips')
  start(@Req() req: Request, @Body() dto: StartTripDto) {
    return this.service.start(this.familyId(req), this.userId(req), dto);
  }

  @Patch('trips/:id/items')
  patchItems(@Req() req: Request, @Param('id') id: string, @Body() dto: PatchTripItemsDto) {
    return this.service.patchItems(this.familyId(req), id, dto);
  }

  @Post('trips/:id/close')
  close(@Req() req: Request, @Param('id') id: string, @Body() dto: CloseTripDto) {
    return this.service.close(this.familyId(req), id, dto);
  }

  @Get('trips')
  list(@Req() req: Request, @Query('status') status?: 'OPEN' | 'CLOSED' | 'CANCELED') {
    return this.service.list(this.familyId(req), status);
  }

  @Get('trips/:id')
  get(@Req() req: Request, @Param('id') id: string) {
    return this.service.get(this.familyId(req), id);
  }
}
