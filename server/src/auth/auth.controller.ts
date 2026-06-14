import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard'
import { UpdateMeDto } from '../users/dto/update-me.dto'
import type { UserDocument } from '../users/user.schema'
import { UsersService } from '../users/users.service'

@Controller('auth')
@UseGuards(FirebaseAuthGuard)
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('session')
  session(@CurrentUser() user: UserDocument) {
    return this.usersService.toSafeProfile(user)
  }

  @Get('me')
  me(@CurrentUser() user: UserDocument) {
    return this.usersService.toSafeProfile(user)
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: UserDocument, @Body() dto: UpdateMeDto) {
    const updated = await this.usersService.updateMe(user._id, dto)
    return this.usersService.toSafeProfile(updated)
  }
}
