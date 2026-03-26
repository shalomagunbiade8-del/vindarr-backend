import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';

@Injectable()
export class SessionsService {

  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async create(data: Partial<Session>) {
  const session = this.sessionRepository.create({
    ...data,
    status: 'pending'
  });

  const saved = await this.sessionRepository.save(session);

  // 🔥 generate Meetify link AFTER save (so we have ID)
  saved.meetingLink = `https://meet.jit.si/oraizon-session-${saved.id}`;

  return this.sessionRepository.save(saved);
}

  async findAll() {
    return this.sessionRepository.find();
  }

  async getLearnerSessions(userId: number) {

  return this.sessionRepository.find({
    where: { learnerId: userId },
    relations: ['coach', 'coach.user'],
    order: { date: 'ASC' }
  });

}

async getCoachSessions(coachId: number) {

  return this.sessionRepository.find({
    where: { coachId },
    relations: ['learner'], // 🔥 THIS FIXES username display
    order: { date: 'ASC' }
  });

} 

  async findUserSessions(userId: number) {

  return this.sessionRepository.find({
    where: [
      { learnerId: userId },
      { coachId: userId }
    ],
    order: { date: 'ASC' }
  });

}

async deleteSession(id: number) {

  return this.sessionRepository.delete(id);

}

async updateSessionStatus(id: number, status: string) {
  await this.sessionRepository.update(id, { status });
  return this.sessionRepository.findOne({ where: { id } });
}

} 
