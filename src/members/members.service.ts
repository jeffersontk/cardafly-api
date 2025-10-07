import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

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

  update(
    id: string,
    data: Partial<{
      name: string;
      genero: string;
      idade: number;
      peso: number;
      observacoes: string;
      ativo: boolean;
    }>,
  ) {
    return this.prisma.member.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.member.delete({ where: { id } });
  }
}
