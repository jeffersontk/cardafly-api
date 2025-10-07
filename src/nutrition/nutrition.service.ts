import { Injectable } from '@nestjs/common';

@Injectable()
export class NutritionService {
  // tabela simplificada (por 100g)
  private table: Record<
    string,
    { kcal: number; prot: number; carb: number; gord: number; fibra?: number; ferro?: number }
  > = {
    'arroz branco': { kcal: 130, prot: 2.4, carb: 28, gord: 0.3, fibra: 0.4 },
    'feijao carioca': { kcal: 127, prot: 8.7, carb: 22, gord: 0.5, fibra: 8.3, ferro: 2.1 },
    'peito de frango': { kcal: 165, prot: 31, carb: 0, gord: 3.6 },
    lentilha: { kcal: 116, prot: 9, carb: 20, gord: 0.4, fibra: 7.9, ferro: 3.3 },
  };

  compute(items: { name: string; grams: number }[]) {
    const total = { kcal: 0, prot: 0, carb: 0, gord: 0, fibra: 0, ferro: 0 };
    for (const it of items) {
      const key = it.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
      const ref = this.table[key];
      if (!ref) continue;
      const factor = it.grams / 100;
      total.kcal += ref.kcal * factor;
      total.prot += ref.prot * factor;
      total.carb += ref.carb * factor;
      total.gord += ref.gord * factor;
      total.fibra += (ref.fibra || 0) * factor;
      total.ferro += (ref.ferro || 0) * factor;
    }
    Object.keys(total).forEach(
      (k) => ((total as any)[k] = Math.round((total as any)[k] * 10) / 10),
    );
    return total;
  }
}
