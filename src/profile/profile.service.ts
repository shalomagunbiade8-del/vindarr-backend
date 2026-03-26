import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // =========================
  // GET CURRENT USER PROFILE
  // /profile/me
  // =========================
  async getMyProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }

  // =========================
  // GET PROFILE BY USERNAME
  // /profile/:username
  // =========================
  async getProfileByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }

  // =========================
  // UPDATE PROFILE
  // PATCH /profile
  // =========================
  async updateProfile(
    userId: number,
    data: {
      username?: string;
      avatar?: string;
      bio?: string;
    },
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.username !== undefined) {
      user.username = data.username;
    }

    if (data.avatar !== undefined) {
      user.avatar = data.avatar;
    }

    if (data.bio !== undefined) {
      user.bio = data.bio;
    }

    const updatedUser = await this.userRepository.save(user);

    const { password, ...safeUser } = updatedUser;

    return safeUser;
  }
}