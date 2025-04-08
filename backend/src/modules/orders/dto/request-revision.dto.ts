import { IsString, IsOptional } from 'class-validator';

export class RequestRevisionDto {
  @IsString()
  @IsOptional()
  revisionMessage?: string;
} 