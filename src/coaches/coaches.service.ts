import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from './coach.entity';

@Injectable()
export class CoachesService {

  constructor(
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
  ) {}

  async create(data: any, userId: number) {

  const existing = await this.coachRepository.findOne({
    where: { userId }
  });

  if (existing) {
    throw new BadRequestException('You already applied as a travel coach');
  }

  const coach = this.coachRepository.create({
    ...data,
    userId,
    verified: false // 🔥 ensure default
  });

  return this.coachRepository.save(coach);
} 


  async findAll() {
  return this.coachRepository.find({
    where: { verified: true }, // 🔥 CRITICAL
    relations: ['user']
  });
} 


  async findOne(id: number) {
  return this.coachRepository.findOne({
    where: { id },
    relations: ['user']
  });
} 


async verifyCoach(id: number) {

  await this.coachRepository.update(id, {
    verified: true
  });

  return this.findOne(id);

} 

async findByUser(userId: number) {

  return this.coachRepository.findOne({
    where: { userId },
    relations: ['user']
  });

} 

async updateCoach(id: number, data: Partial<Coach>) {

  await this.coachRepository.update(id, data);

  return this.findOne(id);

}

async findPending() {
  return this.coachRepository.find({
    where: { verified: false },
    relations: ['user']
  });
} 

} 

