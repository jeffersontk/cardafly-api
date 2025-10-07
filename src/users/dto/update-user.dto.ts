import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstname?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastname?: string;
}
