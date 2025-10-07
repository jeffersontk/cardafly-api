// src/grocery/dto/create-grocery-list.dto.ts
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested, IsInt, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export enum ListCategoryDto {
  MERCEARIA = 'MERCEARIA',
  LATICINIOS = 'LATICINIOS',
  LIMPEZA = 'LIMPEZA',
  HORTIFRUTI = 'HORTIFRUTI',
  BEBIDAS = 'BEBIDAS',
  OUTROS = 'OUTROS',
}

export class GroceryListItemInput {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() brand?: string;
  @IsString() unidade: string; // 'g' | 'ml' | 'un'
  @IsInt() quantidade: number;
  @IsOptional() @IsString() notes?: string;
}

export class CreateGroceryListDto {
  @IsString() @IsNotEmpty() title: string;
  @IsEnum(ListCategoryDto) category: ListCategoryDto;
  @IsOptional() @IsBoolean() archived?: boolean;
  @IsDate() weekStart: Date;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => GroceryListItemInput)
  items?: GroceryListItemInput[];
}

export class PatchGroceryListDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsEnum(ListCategoryDto) category?: ListCategoryDto;
  @IsOptional() @IsBoolean() archived?: boolean;
}

export class PatchGroceryListItemDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() unidade?: string;
  @IsOptional() @IsInt() quantidade?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsBoolean() checked?: boolean;
}
