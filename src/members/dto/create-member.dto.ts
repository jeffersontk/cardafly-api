import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export enum Genero {
  masculino = 'masculino',
  feminino = 'feminino',
  outro = 'outro',
}

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Genero)
  genero: Genero;

  @IsInt()
  @Min(0)
  idade: number;

  @IsInt()
  @Min(0)
  peso: number;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  ativo: boolean;
}
