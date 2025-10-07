import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { MembersService } from './members.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('members')
export class MembersController {
  constructor(private readonly service: MembersService) {}

  private activeFamilyId(req: Request) {
    return (req as any).user?.activeFamilyId as string;
  }

  // POST /api/members
  @Post()
  create(
    @Req() req: Request,
    @Body()
    body: {
      familyId?: string;
      name: string;
      genero: string;
      idade: number;
      peso: number;
      observacoes?: string;
      ativo?: boolean;
    },
  ) {
    const familyId = body.familyId || this.activeFamilyId(req);
    return this.service.create({
      familyId,
      name: body.name,
      genero: body.genero,
      idade: Number(body.idade),
      peso: Number(body.peso),
      observacoes: body.observacoes ?? '',
      ativo: body.ativo ?? true,
    });
  }

  // GET /api/members/family/:familyId
  @Get('family/:familyId')
  listByFamily(@Param('familyId') familyId: string) {
    return this.service.listByFamily(familyId);
  }

  // PATCH /api/members/:id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      genero: string;
      idade: number;
      peso: number;
      observacoes: string;
      ativo: boolean;
    }>,
  ) {
    return this.service.update(id, body);
  }

  // DELETE /api/members/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
