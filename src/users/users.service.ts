import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstname: dto.firstname ?? undefined,
        lastname: dto.lastname ?? undefined,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Lista as famílias em que o usuário participa, com o papel (OWNER/MEMBER).
   */
  async getMyFamilies(userId: string) {
    const links = await this.prisma.userFamily.findMany({
      where: { userId },
      select: {
        role: true,
        createdAt: true,
        family: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Formato amigável
    return links.map((l) => ({
      role: l.role,
      joinedAt: l.createdAt,
      family: l.family,
    }));
  }
}
