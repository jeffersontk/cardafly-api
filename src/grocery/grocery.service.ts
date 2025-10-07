// src/grocery/grocery.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGroceryListDto,
  GroceryListItemInput,
  PatchGroceryListDto,
  PatchGroceryListItemDto,
} from './dto/create-grocery-list.dto';
import { ListCategory } from '@prisma/client';

@Injectable()
export class GroceryService {
  constructor(private prisma: PrismaService) {}

  findAll(familyId: string) {
    return this.prisma.groceryList.findMany({
      where: { familyId, archived: false },
      orderBy: { updatedAt: 'desc' },
      include: { items: true },
    });
  }

  async findOne(familyId: string, id: string) {
    const list = await this.prisma.groceryList.findFirst({
      where: { id, familyId },
      include: { items: true },
    });
    if (!list) throw new NotFoundException('Lista não encontrada');
    return list;
  }

  private startOfWeekUTC(input?: string | Date) {
    const d = input ? new Date(input) : new Date();
    // zera horário e normaliza para segunda-feira (ISO week)
    d.setUTCHours(0, 0, 0, 0);
    const day = d.getUTCDay() || 7; // domingo=0 -> 7
    if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
    return d;
  }

  create(familyId: string, dto: CreateGroceryListDto) {
    return this.prisma.groceryList.create({
      data: {
        family: { connect: { id: familyId } },
        // **AQUI**: envie o weekStart obrigatório
        weekStart: this.startOfWeekUTC(dto.weekStart),
        title: dto.title,
        category: dto.category as ListCategory,
        archived: dto.archived ?? false,
        items: dto.items?.length
          ? {
              create: dto.items.map((i) => ({
                name: i.name,
                brand: i.brand ?? null,
                unidade: i.unidade,
                quantidade: i.quantidade,
                notes: i.notes ?? null,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
  }

  async patchList(familyId: string, id: string, dto: PatchGroceryListDto) {
    const found = await this.prisma.groceryList.findFirst({ where: { id, familyId } });
    if (!found) throw new NotFoundException('Lista não encontrada');
    return this.prisma.groceryList.update({
      where: { id },
      data: {
        title: dto.title ?? found.title,
        category: (dto as any).category ?? found.category,
        archived: typeof dto.archived === 'boolean' ? dto.archived : found.archived,
      },
      include: { items: true },
    });
  }

  async addItem(familyId: string, listId: string, item: GroceryListItemInput) {
    const list = await this.prisma.groceryList.findFirst({ where: { id: listId, familyId } });
    if (!list) throw new NotFoundException('Lista não encontrada');
    return this.prisma.groceryListItem.create({
      data: {
        groceryListId: listId,
        name: item.name,
        brand: item.brand,
        unidade: item.unidade,
        quantidade: item.quantidade,
        notes: item.notes,
      },
    });
  }

  async patchItem(familyId: string, listId: string, itemId: string, dto: PatchGroceryListItemDto) {
    const item = await this.prisma.groceryListItem.findFirst({
      where: { id: itemId, groceryListId: listId, list: { familyId } },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    return this.prisma.groceryListItem.update({
      where: { id: itemId },
      data: {
        name: dto.name ?? item.name,
        brand: dto.brand ?? item.brand,
        unidade: dto.unidade ?? item.unidade,
        quantidade: typeof dto.quantidade === 'number' ? dto.quantidade : item.quantidade,
        notes: dto.notes ?? item.notes,
        checked: typeof dto.checked === 'boolean' ? dto.checked : item.checked,
      },
    });
  }

  async removeItem(familyId: string, listId: string, itemId: string) {
    const item = await this.prisma.groceryListItem.findFirst({
      where: { id: itemId, groceryListId: listId, list: { familyId } },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    return this.prisma.groceryListItem.delete({ where: { id: itemId } });
  }

  private toDateOnly(input: string | Date): Date {
    const d = new Date(input);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  async getForWeek(familyId: string, weekStart: string) {
    const ws = this.toDateOnly(weekStart);
    return this.prisma.groceryList.findUnique({
      where: { family_weekStart: { familyId, weekStart: ws } }, // <- nome correto
      include: { items: true },
    });
  }

  async upsertForWeek(
    familyId: string,
    weekStart: string,
    items: Array<{ name: string; brand?: string; unidade: 'un' | 'g' | 'ml'; quantidade: number }>,
  ) {
    const ws = this.toDateOnly(weekStart);

    // 1) Garante que a lista da semana exista
    const list = await this.prisma.groceryList.upsert({
      where: { family_weekStart: { familyId, weekStart: ws } }, // <- nome correto
      create: {
        familyId,
        weekStart: ws,
        title: `Lista da semana ${weekStart}`,
        category: ListCategory.OUTROS,
        archived: false,
      },
      update: {},
    });

    // 2) Substitui os itens da lista pela carga recebida
    const updated = await this.prisma.groceryList.update({
      where: { id: list.id },
      data: {
        items: {
          deleteMany: {}, // apaga todos os itens anteriores
          create: items.map((i) => ({
            name: i.name,
            brand: i.brand ?? null,
            unidade: i.unidade,
            quantidade: i.quantidade,
          })),
        },
      },
      include: { items: true },
    });

    return updated;
  }
}
