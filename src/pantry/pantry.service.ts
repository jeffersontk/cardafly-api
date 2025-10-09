// src/pantry/pantry.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type UpsertManyItem = {
  familyId?: string;
  item: string;
  unidade: string;
  brand?: string | null;
  quantidade?: number;
  delta?: number;
};

@Injectable()
export class PantryService {
  constructor(private readonly prisma: PrismaService) {}

  list(familyId: string) {
    return this.prisma.pantryItem.findMany({
      where: { familyId },
      orderBy: [{ item: 'asc' }, { brand: 'asc' }],
    });
  }

  private toIntNonNegative(n: number | undefined) {
    if (typeof n !== 'number' || Number.isNaN(n)) return 0;
    const v = Math.trunc(n);
    return v < 0 ? 0 : v;
  }

  async upsert(
    familyId: string,
    item: string,
    unidade: string,
    brand?: string | null,
    delta?: number,
    quantidade?: number,
  ) {
    const brandNorm = brand ?? null;
    const itemNorm = item.trim();
    const unidadeNorm = unidade.trim();

    const found = await this.prisma.pantryItem.findFirst({
      where: { familyId, item: itemNorm, unidade: unidadeNorm, brand: brandNorm },
    });

    if (found) {
      const base = this.toIntNonNegative(found.quantidade ?? 0);
      const next =
        typeof quantidade === 'number'
          ? this.toIntNonNegative(quantidade)
          : this.toIntNonNegative(base + (delta ?? 0));

      return this.prisma.pantryItem.update({
        where: { id: found.id },
        data: { quantidade: next },
      });
    }

    return this.prisma.pantryItem.create({
      data: {
        familyId,
        item: itemNorm,
        unidade: unidadeNorm,
        brand: brandNorm,
        quantidade: this.toIntNonNegative(quantidade ?? 0),
      },
    });
  }

  async upsertMany(items: UpsertManyItem[], fallbackFamilyId: string) {
    return Promise.all(
      items.map((i) =>
        this.upsert(
          i.familyId ?? fallbackFamilyId,
          i.item,
          i.unidade,
          i.brand ?? null,
          typeof i.delta === 'number' ? i.delta : undefined,
          typeof i.quantidade === 'number' ? i.quantidade : undefined,
        ),
      ),
    );
  }

  // ✅ faltava este método
  async remove(familyId: string, item: string, unidade: string, brand?: string | null) {
    const r = await this.prisma.pantryItem.deleteMany({
      where: {
        familyId,
        item: item.trim(),
        unidade: unidade.trim(),
        brand: (brand ?? null) as string | null,
      },
    });
    return { deleted: r.count };
  }

  async removeMany(
    items: Array<{ familyId?: string; item: string; unidade: string; brand?: string | null }>,
    fallbackFamilyId: string,
  ) {
    const results = await this.prisma.$transaction(
      items.map((i) =>
        this.prisma.pantryItem.deleteMany({
          where: {
            familyId: i.familyId ?? fallbackFamilyId,
            item: i.item.trim(),
            unidade: i.unidade.trim(),
            brand: (i.brand ?? null) as string | null,
          },
        }),
      ),
    );
    return { deleted: results.reduce((acc, r) => acc + r.count, 0) };
  }
}
