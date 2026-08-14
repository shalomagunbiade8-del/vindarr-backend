import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class SendMessageDto {

  @IsString()
  receiverUsername: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsOptional()
  @IsString()
  attachmentType?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  replyToId?: number;
}