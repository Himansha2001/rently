import type { Request } from 'express'
import type { UserDocument } from '../../users/user.schema'

export interface RequestWithUser extends Request {
  user?: UserDocument
}
