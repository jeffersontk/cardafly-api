// src/shopping/shopping.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloseTripDto, PatchTripItemsDto, StartTripDto } from './dto/shopping.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShoppingService {
  constructor(private prisma: PrismaService) {}

  async start(familyId: string, userId: string, dto: StartTripDto) {
    // cria trip
    const trip = await this.prisma.shoppingTrip.create({
      data: {
        familyId,
        createdBy: userId,
        storeName: dto.storeName,
        groceryListId: dto.groceryListId ?? null,
        status: 'OPEN',
      },
    });

    // se veio lista, snapshot dos itens
    if (dto.groceryListId) {
      const list = await this.prisma.groceryList.findFirst({
        where: { id: dto.groceryListId, familyId },
        include: { items: true },
      });
      if (list) {
        await this.prisma.shoppingTripItem.createMany({
          data: list.items.map(li => ({
            tripId: trip.id,
            listItemId: li.id,
            name: li.name,
            brand: li.brand ?? null,
            unidade: li.unidade,
            qtyPlanned: li.quantidade,
            qtyBought: 0,
          })),
        });
      }
    }
    return this.get(familyId, trip.id);
  }

  list(familyId: string, status?: 'OPEN' | 'CLOSED' | 'CANCELED') {
    return this.prisma.shoppingTrip.findMany({
      where: { familyId, ...(status ? { status } : {}) },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      include: { items: true, groceryList: true },
    });
  }

  async get(familyId: string, id: string) {
    const trip = await this.prisma.shoppingTrip.findFirst({
      where: { id, familyId },
      include: { items: true, groceryList: { include: { items: true } } },
    });
    if (!trip) throw new NotFoundException('Viagem não encontrada');
    return trip;
  }

  async patchItems(familyId: string, tripId: string, dto: PatchTripItemsDto) {
    const trip = await this.prisma.shoppingTrip.findFirst({ where: { id: tripId, familyId } });
    if (!trip) throw new NotFoundException('Viagem não encontrada');
    if (trip.status !== 'OPEN') throw new NotFoundException('Viagem não está aberta');

    // upsert linha-a-linha
    for (const it of dto.items) {
      if ('listItemId' in it) {
        const row = await this.prisma.shoppingTripItem.findFirst({
          where: { tripId, listItemId: it.listItemId },
        });
        if (row) {
          const lineTotal = it.unitPrice != null ? new Prisma.Decimal(it.unitPrice).mul(it.qtyBought) : null;
          await this.prisma.shoppingTripItem.update({
            where: { id: row.id },
            data: {
              qtyBought: it.qtyBought,
              unitPrice: it.unitPrice != null ? new Prisma.Decimal(it.unitPrice) : row.unitPrice,
              lineTotal,
            },
          });
        } else {
          await this.prisma.shoppingTripItem.create({
            data: {
              tripId,
              listItemId: it.listItemId,
              name: '', // opcional preencher via join
              unidade: 'un',
              qtyBought: it.qtyBought,
              unitPrice: it.unitPrice != null ? new Prisma.Decimal(it.unitPrice) : null,
              lineTotal: it.unitPrice != null ? new Prisma.Decimal(it.unitPrice).mul(it.qtyBought) : null,
            },
          });
        }
      } else {
        const lineTotal = it.unitPrice != null ? new Prisma.Decimal(it.unitPrice).mul(it.qtyBought) : null;
        await this.prisma.shoppingTripItem.create({
          data: {
            tripId,
            name: it.name,
            brand: it.brand ?? null,
            unidade: it.unidade,
            qtyBought: it.qtyBought,
            unitPrice: it.unitPrice != null ? new Prisma.Decimal(it.unitPrice) : null,
            lineTotal,
          },
        });
      }
    }
    return this.get(familyId, tripId);
  }

  async close(familyId: string, tripId: string, dto: CloseTripDto) {
    const trip = await this.prisma.shoppingTrip.findFirst({
      where: { id: tripId, familyId },
      include: { items: true },
    });
    if (!trip) throw new NotFoundException('Viagem não encontrada');
    if (trip.status !== 'OPEN') throw new NotFoundException('Viagem não está aberta');

    // calcula total se não informado
    let total = dto.totalSpent != null ? new Prisma.Decimal(dto.totalSpent) : new Prisma.Decimal(0);
    if (dto.totalSpent == null) {
      for (const it of trip.items) {
        if (it.lineTotal != null) total = total.add(it.lineTotal);
        else if (it.unitPrice != null) total = total.add(it.unitPrice.mul(it.qtyBought));
      }
    }

    // aplica no estoque (upsert)
    for (const it of trip.items) {
      if (it.qtyBought <= 0) continue;
      const found = await this.prisma.pantryItem.findFirst({
        where: { familyId, item: it.name, unidade: it.unidade, brand: it.brand ?? null },
      });
      if (found) {
        await this.prisma.pantryItem.update({
          where: { id: found.id },
          data: { quantidade: found.quantidade + it.qtyBought },
        });
        await this.prisma.shoppingTripItem.update({
          where: { id: it.id },
          data: { pantryItemId: found.id, pantryUpsertedAt: new Date() },
        });
      } else {
        const created = await this.prisma.pantryItem.create({
          data: {
            familyId,
            item: it.name,
            brand: it.brand ?? null,
            unidade: it.unidade,
            quantidade: it.qtyBought,
          },
        });
        await this.prisma.shoppingTripItem.update({
          where: { id: it.id },
          data: { pantryItemId: created.id, pantryUpsertedAt: new Date() },
        });
      }
    }

    return this.prisma.shoppingTrip.update({
      where: { id: tripId },
      data: { status: 'CLOSED', finishedAt: new Date(), totalSpent: total },
      include: { items: true },
    });
  }
}
