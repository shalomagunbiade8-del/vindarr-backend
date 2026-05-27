import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateStoryDto {

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

}