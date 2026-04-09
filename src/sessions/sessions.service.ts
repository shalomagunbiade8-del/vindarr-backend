import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Session } from './session.entity';
import { Coach } from '../coaches/coach.entity';
import { In } from 'typeorm'; 

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
  const sessions = await this.sessionRepository.find({
    where: { learnerId: userId },
    relations: ['coach', 'coach.user'],
    order: { date: 'ASC' }
  });

  return sessions.map(session => {
    if (session.status !== 'accepted') {
      session.meetingLink = null;
    }
    return session;
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

    if (status === 'accepted' && session.paymentStatus !== 'paid') {
  throw new ForbiddenException('User has not paid yet');
} 

    session.status = status;

// mark session as completed (for payouts)
if (status === 'accepted' && session.paymentStatus === 'paid') {
  session.isCompleted = true;
}

    return this.sessionRepository.save(session);
  }

  async markSessionAsPaid(sessionId: number) {
  const session = await this.sessionRepository.findOne({
    where: { id: sessionId }
  });

  if (!session) {
    throw new NotFoundException('Session not found');
  }

  session.paymentStatus = 'paid'; // ✅ FIXED

  return this.sessionRepository.save(session);
} 

// bank payout related 
async getPendingPayouts() {
  return this.sessionRepository.find({
    where: {
      paymentStatus: 'paid',
      status: 'accepted',
      isCompleted: true,
      paidOut: false,
    },
    relations: ['coach', 'coach.user'],
  });
} 

async getCoachPayoutSummary() {
  const sessions = await this.getPendingPayouts();

  const summary = {};

  sessions.forEach(session => {
    const coachId = session.coach.id;

    if (!summary[coachId]) {
      summary[coachId] = {
  coach: {
    id: session.coach.id,
    name: session.coach.user?.username,
    bankName: session.coach.user?.bankName,
    accountNumber: session.coach.user?.accountNumber,
    accountName: session.coach.user?.accountName,
  },
  total: 0,
  sessions: [],
}; 

    }

    const COMMISSION = 0.4;
const coachEarning = session.amount * (1 - COMMISSION); 

    summary[coachId].total += coachEarning;
    summary[coachId].sessions.push(session.id);
  });

  return Object.values(summary);
} 

async markAsPaid(sessionIds: number[]) {
  await this.sessionRepository.update(
    { id: In(sessionIds) },
    {
      paidOut: true,
      paidOutAt: new Date(),
    }
  );

  return { message: 'Payout marked as completed' };
} 

} 
