import {
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateCommentDto {

  @IsString()
  text: string;

  @IsOptional()
  @IsNumber()
  time?: number;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsNumber()
  videoId?: number;

  @IsOptional()
  @IsNumber()
  storyId?: number;

}