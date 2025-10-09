// src/grocery/dto/create-grocery-list.dto.ts
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsISO8601,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListCategory } from '@prisma/client';

export class GroceryListItemInput {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  brand?: string | null;

  @IsEnum({ un: 'un', g: 'g', ml: 'ml' } as const)
  unidade!: 'un' | 'g' | 'ml';

  @IsInt()
  @Min(0)
  quantidade!: number;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class CreateGroceryListDto {
  // Obrigatório e aceito como string YYYY-MM-DD
  @IsISO8601()
  weekStart!: string;

  @IsString()
  title!: string;

  @IsEnum(ListCategory)
  category!: ListCategory;

  @IsOptional()
  @IsBoolean()
  archived?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroceryListItemInput)
  items?: GroceryListItemInput[];
}

export class PatchGroceryListDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(ListCategory)
  category?: ListCategory;

  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}

export class PatchGroceryListItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  brand?: string | null;

  @IsOptional()
  @IsEnum({ un: 'un', g: 'g', ml: 'ml' } as const)
  unidade?: 'un' | 'g' | 'ml';

  @IsOptional()
  @IsInt()
  @Min(0)
  quantidade?: number;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsBoolean()
  checked?: boolean;
}
