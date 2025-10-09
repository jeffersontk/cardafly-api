import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  private isNotFound(e: unknown): boolean {
    return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025';
  }

  listByFamily(familyId: string) {
    return this.prisma.member.findMany({
      where: { familyId },
      orderBy: { name: 'asc' },
    });
  }

  create(data: {
    familyId: string;
    name: string;
    genero: string;
    idade: number;
    peso: number;
    observacoes?: string;
    ativo?: boolean;
  }) {
    return this.prisma.member.create({ data });
  }

async update(
    id: string,
    data: Partial<{
      name: string;
      genero: string;
      idade: number;
      peso: number;
      observacoes: string | null;
      ativo: boolean;
    }>,
  ) {
    try {
      return await this.prisma.member.update({
        where: { id },
        data,
      });
    } catch (e) {
      if (this.isNotFound(e)) {
        throw new NotFoundException('Membro não encontrado');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.member.delete({
        where: { id },
      });
    } catch (e) {
      if (this.isNotFound(e)) {
        throw new NotFoundException('Membro não encontrado');
      }
      throw e;
    }
  }
}
