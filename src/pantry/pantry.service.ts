// src/pantry/pantry.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Unidade = 'g' | 'ml' | 'un';

@Injectable()
export class PantryService {
  constructor(private readonly prisma: PrismaService) {}

  list(familyId: string) {
    return this.prisma.pantryItem.findMany({ where: { familyId }, orderBy: [{ item: 'asc' }, { brand: 'asc' }] });
  }

  async upsert(
    familyId: string,
    item: string,
    unidade: Unidade,
    brand?: string,
    delta?: number,
    quantidade?: number,
  ) {
    const found = await this.prisma.pantryItem.findFirst({
      where: { familyId, item, unidade, brand: brand ?? null },
    });

    if (found) {
      const base = found.quantidade ?? 0;
      const next = typeof quantidade === 'number' ? quantidade : base + (delta ?? 0);
      return this.prisma.pantryItem.update({
        where: { id: found.id },
        data: { quantidade: Math.max(0, next) },
      });
    }

    return this.prisma.pantryItem.create({
      data: {
        familyId,
        item,
        brand,
        unidade,
        quantidade: Math.max(0, quantidade ?? 0),
      },
    });
  }

  remove(familyId: string, item: string, unidade: Unidade, brand?: string) {
    return this.prisma.pantryItem.deleteMany({ where: { familyId, item, unidade, brand: brand ?? null } });
  }
}
