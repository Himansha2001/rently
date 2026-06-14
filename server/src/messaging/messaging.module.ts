import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { FirebaseAdminModule } from '../firebase/firebase-admin.module'
import { ListingsModule } from '../listings/listings.module'
import { UsersModule } from '../users/users.module'
import { Conversation, ConversationSchema } from './conversation.schema'
import { Message, MessageSchema } from './message.schema'
import { MessagingController } from './messaging.controller'
import { MessagingService } from './messaging.service'

@Module({
  imports: [
    FirebaseAdminModule,
    UsersModule,
    ListingsModule,
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule {}
