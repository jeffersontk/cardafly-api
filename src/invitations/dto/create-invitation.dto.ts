import { IsEmail, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { FamilyRole } from '@prisma/client';

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(FamilyRole)
  role?: FamilyRole = FamilyRole.MEMBER;

  /** em dias (default 7) */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  expiresInDays?: number = 7;
}
