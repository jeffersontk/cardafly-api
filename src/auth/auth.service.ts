// src/auth/auth.service.ts (versão com transação e pequenos ajustes)
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { FamilyRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new UnauthorizedException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const { user, family } = await this.prisma.$transaction(async (tx) => {
      // usuário
      const user = await tx.user.create({
        data: {
          email: dto.email,
          firstname: dto.firstname,
          lastname: dto.lastname,
          passwordHash,
        },
      });

      // família
      const family = await tx.family.create({
        data: { name: `${dto.lastname} family` },
      });

      // vínculo como OWNER
      await tx.userFamily.create({
        data: { userId: user.id, familyId: family.id, role: FamilyRole.OWNER },
      });

      // member "eu"
      await tx.member.create({
        data: {
          familyId: family.id,
          userId: user.id,
          name: dto.firstname,
          genero: 'outro',
          idade: 0,
          peso: 0,
          ativo: true,
        },
      });

      return { user, family };
    });

    return this.token(user.id, user.email, family.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    // Prioriza a família onde ele é OWNER; se não houver, pega a mais antiga
    const owner = await this.prisma.userFamily.findFirst({
      where: { userId: user.id, role: FamilyRole.OWNER },
    });
    const uf =
      owner ??
      (await this.prisma.userFamily.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      }));
    if (!uf) throw new UnauthorizedException('Usuário sem família vinculada');

    return this.token(user.id, user.email, uf.familyId);
  }

  private token(userId: string, email: string, activeFamilyId: string) {
    const payload = { sub: userId, email, activeFamilyId };
    const access_token = this.jwt.sign(payload, {
      secret: this.cfg.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });
    return { access_token };
  }
}
