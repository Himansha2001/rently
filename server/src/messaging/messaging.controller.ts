import { Body, Controller, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard'
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe'
import type { UserDocument } from '../users/user.schema'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { MessageQueryDto } from './dto/message-query.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { MessagingService } from './messaging.service'

@Controller('conversations')
@UseGuards(FirebaseAuthGuard)
export class MessagingController {
  constructor(@Inject(MessagingService) private readonly messagingService: MessagingService) {}

  @Get()
  list(@CurrentUser() user: UserDocument) {
    return this.messagingService.listConversations(user)
  }

  @Post()
  open(@CurrentUser() user: UserDocument, @Body() dto: CreateConversationDto) {
    return this.messagingService.openConversation(user, dto)
  }

  @Get(':id/messages')
  messages(
    @CurrentUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: string,
    @Query() query: MessageQueryDto,
  ) {
    return this.messagingService.listMessages(user, id, query)
  }

  @Post(':id/messages')
  send(
    @CurrentUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(user, id, dto)
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: UserDocument, @Param('id', ParseObjectIdPipe) id: string) {
    return this.messagingService.markRead(user, id)
  }
}
