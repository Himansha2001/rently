import 'reflect-metadata'
import 'dotenv/config'
import mongoose from 'mongoose'
import { User, UserSchema } from '../src/users/user.schema'

const UserModel = mongoose.model(User.name, UserSchema)

async function main() {
  const mongoUri = process.env.MONGODB_URI
  const firebaseUid = process.env.FIREBASE_UID?.trim()
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required')
  }
  if (!firebaseUid && !adminEmail) {
    throw new Error('Set FIREBASE_UID or ADMIN_EMAIL to promote an existing user')
  }

  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== 'production',
  })

  const query = firebaseUid ? { firebaseUid } : { email: adminEmail }
  const user = await UserModel.findOne(query)
  if (!user) {
    throw new Error('No matching MongoDB user profile was found')
  }

  const updated = await UserModel.findByIdAndUpdate(
    user._id,
    { $addToSet: { roles: 'admin' } },
    { new: true },
  )

  if (!updated) {
    throw new Error('Failed to update user roles')
  }

  console.log(`Admin role granted to ${updated.email}`)
  console.log(`Roles: ${updated.roles.join(', ')}`)
}

void main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
