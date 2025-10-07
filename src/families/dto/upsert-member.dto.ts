import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum Genero {
  masculino = 'masculino',
  feminino = 'feminino',
  outro = 'outro',
}

export class UpsertMemberDto {
  @IsOptional() @IsString() id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Genero)
  genero: Genero;

  @Type(() => Number)
  @IsNumber()
  idade: number;

  @Type(() => Number)
  @IsNumber()
  peso: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  ativo?: boolean;
}
