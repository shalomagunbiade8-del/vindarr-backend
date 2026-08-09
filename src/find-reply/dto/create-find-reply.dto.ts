import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateFindReplyDto {

  @IsString()
  videoUrl: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}