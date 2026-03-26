import { IsEmail, IsNotEmpty, IsEnum, MinLength } from 'class-validator';

export enum UserRole {
  LEARNER = 'learner',
  CREATOR = 'creator',
  COACH = 'coach',
}

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
} 