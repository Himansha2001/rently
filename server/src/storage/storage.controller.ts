import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard'
import type { UserDocument } from '../users/user.schema'
import { StorageService, UploadedImageFile } from './storage.service'

@Controller('uploads')
@UseGuards(FirebaseAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('listing-images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: memoryStorage(),
      limits: {
        files: 10,
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadListingImages(
    @CurrentUser() user: UserDocument,
    @UploadedFiles() files: UploadedImageFile[] = [],
  ) {
    return this.storageService.uploadListingImages(user, files)
  }
}
