// src/members/dto/upsert-member.dto.ts
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertMemberDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() genero: string; // validar valores permitidos se quiser
  @IsInt() idade: number;
  @IsNumber() peso: number;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
}
