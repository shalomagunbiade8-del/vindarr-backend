import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Patch,
  Param,
  Query,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateBankDto } from './dto/update-bank.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // =========================
  // CREATE USER
  // =========================
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // =========================
  // CURRENT USER
  // GET /users/me
  // =========================
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Req() req: any) {
    return this.usersService.findOneById(
      req.user.userId,
    );
  }

  // =========================
  // SEARCH USERS
  // GET /users/search?q=
  // MUST COME BEFORE :id
  // =========================
  @Get('search')
  searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  // =========================
  // PUBLIC USER PROFILE
  // GET /users/:id
  // =========================
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findPublicById(
      Number(id),
    );
  }

  // =========================
  // GET ALL USERS
  // =========================
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // =========================
  // MAKE ADMIN
  // =========================
  @UseGuards(AuthGuard('jwt'))
  @Patch('make-admin/:username')
  makeAdmin(
    @Param('username') username: string,
    @Req() req: any,
  ) {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.usersService.makeAdmin(
      username,
    );
  }

  // =========================
  // UPDATE BANK DETAILS
  // =========================
  @UseGuards(AuthGuard('jwt'))
@Patch('bank-details')
updateBankDetails(
  @Req() req,
  @Body() dto: UpdateBankDto,
) {

  console.log(
    'BANK DTO:',
    dto,
  );

  return this.usersService.updateBankDetails(
    req.user.userId,
    dto,
  );
}

  // Fetch bank details
  @UseGuards(AuthGuard('jwt'))
@Get('bank-details')
getBankDetails(
  @Req() req,
) {

  return this.usersService.findOneById(
    req.user.userId,
  );

}


}