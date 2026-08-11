import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

import {
  PollMediaType,
} from '../../poll-option/poll-option.entity';

export class CreatePollOptionDto {

  @IsString()
  @MaxLength(200)
  caption: string;

  @IsIn([
    PollMediaType.IMAGE,
    PollMediaType.VIDEO,
  ])
  mediaType: PollMediaType;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}

export class CreatePollDto {

  @IsString()
  @MaxLength(300)
  question: string;

  @IsString()
  @MaxLength(50)
  category: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @ValidateNested({
    each: true,
  })
  @Type(() => CreatePollOptionDto)
  options: CreatePollOptionDto[];
}