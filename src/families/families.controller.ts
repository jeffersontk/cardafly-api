import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { FamiliesService } from './families.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('families')
export class FamiliesController {
  constructor(private readonly service: FamiliesService) {}

  /** Lista as famílias do usuário autenticado */
  @Get()
  async findMine(@Req() req: Request) {
    const userId = (req as any).user.sub as string;
    return this.service.findByUser(userId);
  }

  /** Lista TODAS as famílias (use apenas se precisar) */
  @Get('all')
  async findAll() {
    return this.service.findAll();
  }

  @Get('mine')
  async aliasMine(@Req() req: Request) {
    const userId = (req as any).user.sub as string;
    return this.service.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/members')
  async members(@Param('id') id: string) {
    return this.service.members(id);
  }

  @Post()
  async create(@Body() body: { name: string }) {
    return this.service.create(body.name);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
