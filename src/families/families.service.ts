import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  /** famílias do usuário (onde ele participa via UserFamily) */
  findByUser(userId: string) {
    return this.prisma.family.findMany({
      where: { users: { some: { userId } } },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** todas as famílias — uso administrativo */
  findAll() {
    return this.prisma.family.findMany({
      select: { id: true, name: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const fam = await this.prisma.family.findUnique({
      where: { id },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    if (!fam) throw new NotFoundException('Family not found');
    return fam;
  }

  members(familyId: string) {
    return this.prisma.member.findMany({
      where: { familyId },
      orderBy: { name: 'asc' },
    });
  }

  create(name: string) {
    return this.prisma.family.create({
      data: { name },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
  }

  async update(id: string, data: { name?: string }) {
    const fam = await this.prisma.family.update({
      where: { id },
      data,
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return fam;
  }

  async remove(id: string) {
    await this.prisma.family.delete({ where: { id } });
    return { ok: true };
  }
}
