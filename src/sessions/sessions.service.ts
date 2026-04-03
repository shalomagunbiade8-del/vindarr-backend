import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Session } from './session.entity';
import { Coach } from '../coaches/coach.entity';

@Injectable()
export class SessionsService {

  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,

    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
  ) {}

  async create(data: Partial<Session>) {

    const session = this.sessionRepository.create({
      ...data,
      status: 'pending'
    });

    const saved = await this.sessionRepository.save(session);

    // generate meeting link AFTER save
    saved.meetingLink = `https://meet.jit.si/oraizon-session-${saved.id}`;

    return this.sessionRepository.save(saved);
  }

  async findAll() {
    return this.sessionRepository.find({
      relations: ['coach', 'coach.user', 'learner']
    });
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
      relations: ['learner'],
      order: { date: 'ASC' }
    });
  }

  async deleteSession(id: number) {
    return this.sessionRepository.delete(id);
  }

  async updateSessionStatus(id: number, status: string, userId: number) {

    const session = await this.sessionRepository.findOne({
      where: { id }
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const coach = await this.coachRepository.findOne({
      where: { id: session.coachId }
    });

    if (!coach || coach.userId !== userId) {
      throw new ForbiddenException('Not your session');
    }

    session.status = status;

    return this.sessionRepository.save(session);
  }

  async markSessionAsPaid(sessionId: number) {
  const session = await this.sessionRepository.findOne({
    where: { id: sessionId }
  });

  if (!session) {
    throw new NotFoundException('Session not found');
  }

  session.status = 'paid';

  return this.sessionRepository.save(session);
} 
} 
