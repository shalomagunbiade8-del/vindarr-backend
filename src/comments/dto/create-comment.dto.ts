import {
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

import { Type } from 'class-transformer';


export class CreateCommentDto {

  @IsString()
  text: string;


  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  time?: number;


  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId?: number;


  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  videoId?: number;


  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  storyId?: number;

}
