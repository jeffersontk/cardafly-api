// src/shopping/dto/shopping.dto.ts
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StartTripDto {
  @IsString() @IsNotEmpty() storeName: string;
  @IsOptional() @IsString() groceryListId?: string;
}

class TripItemFromList {
  @IsString() listItemId: string;
  @IsNumber() qtyBought: number;
  @IsOptional() @IsNumber() unitPrice?: number;
}

class TripItemAdhoc {
  @IsString() name: string;
  @IsOptional() @IsString() brand?: string;
  @IsString() unidade: string;
  @IsNumber() qtyBought: number;
  @IsOptional() @IsNumber() unitPrice?: number;
}

export class PatchTripItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  // Aceita itens com listItemId OU ad-hoc
  items: (TripItemFromList | TripItemAdhoc)[];
}

export class CloseTripDto {
  @IsOptional() @IsNumber() totalSpent?: number;
}
