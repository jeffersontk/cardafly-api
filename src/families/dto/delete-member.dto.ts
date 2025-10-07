import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeleteMemberDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() id?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nome?: string;
}
