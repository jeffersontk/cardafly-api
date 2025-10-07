// src/invitations/invitations.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Request } from 'express';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';


@UseGuards(JwtAuthGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private service: InvitationsService) {}
  private user(req: Request) {
    return (req as any).user as { sub: string; email: string; activeFamilyId: string };
  }
  @Get() list(@Req() req: Request) {
    const { activeFamilyId } = this.user(req);
    return this.service.listByFamily(activeFamilyId);
  }
  @Post() create(@Req() req: Request, @Body() dto: CreateInvitationDto) {
    const { sub, activeFamilyId } = this.user(req);
    return this.service.create(sub, activeFamilyId, dto);
  }
  @Delete(':id') cancel(@Req() req: Request, @Param('id') id: string) {
    const { sub, activeFamilyId } = this.user(req);
    return this.service.cancel(sub, activeFamilyId, id);
  }
  @Post('accept') accept(@Req() req: Request, @Body() dto: AcceptInvitationDto) {
    const { sub, email } = this.user(req);
    return this.service.accept(sub, email, dto);
  }
}
