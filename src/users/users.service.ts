import * as bcrypt from 'bcrypt';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // 1️⃣ Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // 2️⃣ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 3️⃣ CREATE USER ENTITY
    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role ?? 'learner',
    });

    // 4️⃣ SAVE TO DB
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string) {
    return this.usersRepository
    .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.email = :email',
    { email })
    .getOne();
    
  }
  async findAll() {
    return this.usersRepository.find();
  }

  async findOneById(id: number) {
  return this.usersRepository.findOne({
    where: { id },
  });
} 

// temporary
async makeAdmin(username: string) {
  const user = await this.usersRepository.findOne({
    where: { username }
  });

  if (!user) {
    throw new BadRequestException('User not found');
  }

  user.role = 'admin';

  await this.usersRepository.save(user);

  return { message: `${username} is now admin` };
} 

// bank payout related
async updateBankDetails(userId: number, dto: any) {
  const user = await this.usersRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  user.bankName = dto.bankName;
  user.accountNumber = dto.accountNumber;
  user.accountName = dto.accountName;

  return this.usersRepository.save(user);
} 


}




