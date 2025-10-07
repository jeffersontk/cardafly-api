import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { FamilyRole } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  private nowPlusDays(days: number) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  }

  /** garante que o solicitante é OWNER da família ativa */
  private async assertOwner(userId: string, familyId: string) {
    const uf = await this.prisma.userFamily.findUnique({
      where: { userId_familyId: { userId, familyId } },
    });
    if (!uf || uf.role !== FamilyRole.OWNER) {
      throw new ForbiddenException('Somente OWNER pode gerenciar convites desta família');
    }
  }

  async listByFamily(familyId: string) {
    return this.prisma.familyInvitation.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, familyId: string, dto: CreateInvitationDto) {
    await this.assertOwner(userId, familyId);

    const code = randomBytes(16).toString('hex');
    const expiresAt = this.nowPlusDays(dto.expiresInDays ?? 7);

    return this.prisma.familyInvitation.create({
      data: {
        familyId,
        email: dto.email.toLowerCase(),
        role: dto.role ?? FamilyRole.MEMBER,
        code,
        expiresAt,
        createdBy: userId,
      },
    });
  }

  async cancel(userId: string, familyId: string, invitationId: string) {
    await this.assertOwner(userId, familyId);

    const inv = await this.prisma.familyInvitation.findFirst({
      where: { id: invitationId, familyId },
    });
    if (!inv) throw new NotFoundException('Convite não encontrado');

    if (inv.acceptedAt) throw new BadRequestException('Convite já foi aceito');
    if (inv.canceledAt) return inv;

    return this.prisma.familyInvitation.update({
      where: { id: invitationId },
      data: { canceledAt: new Date() },
    });
  }

  async accept(userId: string, userEmail: string, dto: AcceptInvitationDto) {
    const inv = await this.prisma.familyInvitation.findUnique({
      where: { code: dto.code },
    });
    if (!inv) throw new NotFoundException('Convite inválido');

    if (inv.canceledAt) throw new BadRequestException('Convite cancelado');
    if (inv.acceptedAt) throw new BadRequestException('Convite já aceito');
    if (inv.expiresAt && inv.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Convite expirado');
    }

    // e-mail do convite precisa bater com o email do usuário logado
    const normalized = userEmail.toLowerCase();
    if (inv.email.toLowerCase() !== normalized) {
      throw new ForbiddenException('Este convite não pertence ao seu e-mail');
    }

    // vincula usuário à família (idempotente)
    await this.prisma.userFamily.upsert({
      where: { userId_familyId: { userId, familyId: inv.familyId } },
      create: { userId, familyId: inv.familyId, role: inv.role },
      update: { role: inv.role }, // pode “promover/downgrade” caso necessário
    });

    // marca como aceito
    const accepted = await this.prisma.familyInvitation.update({
      where: { id: inv.id },
      data: { acceptedAt: new Date() },
    });

    return { accepted, familyId: inv.familyId };
  }
}
