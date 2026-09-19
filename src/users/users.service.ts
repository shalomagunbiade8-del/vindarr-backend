import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { User } from './user.entity';
import {
  CreateUserDto,
} from './dto/create-user.dto';


@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository:
      Repository<User>,
  ) {}


  // =========================================
  // NORMAL USER CREATION
  // =========================================

  async create(
    createUserDto: CreateUserDto,
  ) {

    const normalizedEmail =
      createUserDto.email
        .trim()
        .toLowerCase();


    const existingUser =
      await this.usersRepository
        .createQueryBuilder('user')
        .where(
          'LOWER(user.email) = LOWER(:email)',
          {
            email:
              normalizedEmail,
          },
        )
        .getOne();


    if (existingUser) {

      throw new BadRequestException(
        'User already exists',
      );

    }


    const user =
      this.usersRepository.create({

        username:
          createUserDto.username
            .trim(),

        email:
          normalizedEmail,

        password:
          createUserDto.password,

        role:
          createUserDto.role ??
          'learner',

        googleId:
          null,

      });


    return this.usersRepository.save(
      user,
    );
  }


  // =========================================
  // EMAIL LOOKUP
  // =========================================

  async findByEmail(
    email: string,
  ) {

    return this.usersRepository

      .createQueryBuilder('user')

      .addSelect(
        'user.password',
      )

      .where(
        'LOWER(user.email) = LOWER(:email)',
        {
          email:
            email.trim(),
        },
      )

      .getOne();
  }


  // =========================================
  // GOOGLE ID LOOKUP
  // =========================================

 async findByGoogleId(
  googleId: string,
): Promise<User | null> {
  return this.usersRepository.findOne({
    where: {
      googleId,
    },
  });
}

  // =========================================
  // LINK GOOGLE ACCOUNT
  // =========================================

  async linkGoogleAccount(
    userId: number,
    data: {
      googleId: string;
      avatar?: string | null;
    },
  ) {

    const user =
      await this.usersRepository.findOne({
        where: {
          id: userId,
        },
      });


    if (!user) {

      throw new BadRequestException(
        'User not found',
      );

    }


    user.googleId =
      data.googleId;


    if (
      !user.avatar &&
      data.avatar
    ) {

      user.avatar =
        data.avatar;

    }


    return this.usersRepository.save(
      user,
    );
  }


  // =========================================
  // USERNAME LOOKUP
  // =========================================

  async findByUsername(
    username: string,
  ) {

    return this.usersRepository.findOne({
      where: {
        username,
      },
    });
  }


  // =========================================
  // CREATE GOOGLE USER
  // =========================================

 async createGoogleUser(data: {
  googleId: string;
  email: string;
  username: string;
  avatar?: string | null;
}): Promise<User> {
  const user = this.usersRepository.create({
    googleId: data.googleId,
    email: data.email
      .trim()
      .toLowerCase(),
    username: data.username,
    password: null,
    role: 'learner',
    avatar: data.avatar ?? null,
  });

  return this.usersRepository.save(user);
}


  // =========================================
  // GENERATE UNIQUE USERNAME
  // =========================================

  private async generateUniqueUsername(
    requestedUsername: string,
  ): Promise<string> {

    let base =
      String(
        requestedUsername ||
        'user',
      )
        .trim()
        .toLowerCase()
        .replace(
          /[^a-z0-9_]/g,
          '',
        );


    if (!base) {

      base =
        'user';

    }


    base =
      base.substring(
        0,
        24,
      );


    let username =
      base;

    let counter =
      1;


    while (
      await this.findByUsername(
        username,
      )
    ) {

      username =
        `${base}${counter}`;

      counter++;

    }


    return username;
  }


  // =========================================
  // ALL USERS
  // =========================================

  async findAll() {

    return this.usersRepository.find();

  }


  async getAllUsers() {

    return this.usersRepository.find({

      select: [
        'username',
        'avatar',
      ],

    });

  }


  // =========================================
  // USER BY ID
  // =========================================

  async findOneById(
    id: number,
  ) {

    return this.usersRepository.findOne({

      where: {
        id,
      },

      select: [
        'id',
        'username',
        'email',
        'avatar',
        'bio',
        'role',
        'totalUnderstand',
        'bankName',
        'accountNumber',
        'accountName',
      ],

    });

  }


  async findPublicById(
    id: number,
  ) {

    return this.usersRepository.findOne({

      where: {
        id,
      },

      select: [
        'id',
        'username',
        'avatar',
        'bio',
        'role',
        'totalUnderstand',
      ],

    });

  }


  async findById(
    id: number,
  ) {

    return this.usersRepository.findOne({

      where: {
        id,
      },

    });

  }


  // =========================================
  // ADMIN
  // =========================================

  async makeAdmin(
    username: string,
  ) {

    const user =
      await this.usersRepository.findOne({

        where: {
          username,
        },

      });


    if (!user) {

      throw new BadRequestException(
        'User not found',
      );

    }


    user.role =
      'admin';


    await this.usersRepository.save(
      user,
    );


    return {

      message:
        `${username} is now admin`,

    };

  }


  // =========================================
  // BANK DETAILS
  // =========================================

  async updateBankDetails(
    userId: number,
    dto: any,
  ) {

    const user =
      await this.usersRepository.findOne({

        where: {
          id: userId,
        },

      });


    if (!user) {

      throw new Error(
        'User not found',
      );

    }


    user.bankName =
      dto.bankName;

    user.accountNumber =
      dto.accountNumber;

    user.accountName =
      dto.accountName;


    return this.usersRepository.save(
      user,
    );

  }


  // =========================================
  // SEARCH USERS
  // =========================================

  async searchUsers(
    query: string,
  ) {

    if (!query) {

      return [];

    }


    return this.usersRepository

      .createQueryBuilder('user')

      .select([
        'user.username',
        'user.avatar',
      ])

      .where(
        'LOWER(user.username) LIKE LOWER(:query)',
        {
          query:
            `%${query}%`,
        },
      )

      .getMany();

  }

}