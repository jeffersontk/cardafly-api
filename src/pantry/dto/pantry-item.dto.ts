import { IsString, MinLength, IsOptional, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PantryItemDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  item!: string;

  // no schema é String; não restringimos valores para aceitar 'kg', 'un', etc.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  unidade!: string;

  @IsInt()
  @Min(0)
  quantidade!: number;

  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value?.trim()))
  @IsOptional()
  @IsString()
  brand?: string;

  // opcional: permite vir do payload nos testes; caso ausente, usamos a activeFamilyId do token
  @IsOptional()
  @IsString()
  familyId?: string;
}

export class PantryPatchItemDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  item!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  unidade!: string;

  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value?.trim()))
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsInt()
  quantidade?: number;

  @IsOptional()
  @IsInt()
  delta?: number;

  @IsOptional()
  @IsString()
  familyId?: string;
}
