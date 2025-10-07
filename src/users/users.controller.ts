import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { UserId } from '../common/decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@UserId() userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  updateMe(@UserId() userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(userId, dto);
  }

  @Get('me/families')
  myFamilies(@UserId() userId: string) {
    return this.usersService.getMyFamilies(userId);
  }
}
