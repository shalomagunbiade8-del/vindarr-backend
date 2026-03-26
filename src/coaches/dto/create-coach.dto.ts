import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCoachDto {

  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsString()
  @IsNotEmpty()
  expertise: string;

  @IsNumber()
  hourlyRate: number;

} 
