import {
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateFindDto {

  @IsString()
  @MaxLength(300)
  caption: string;

  @IsString()
  @MaxLength(50)
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsString()
  videoUrl: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}