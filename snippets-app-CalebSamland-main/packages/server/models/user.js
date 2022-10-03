import mongoose from 'mongoose'
const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    match: [/(^$|^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/, "Invalid Email Format"]
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  profile_image: { type: String, default: '/fox.svg' },
  posts: [
    {
      type: ObjectId,
      ref: 'Post',
    },
  ],
  postLikes: [
    {
      type: ObjectId,
      ref: 'Post',
    },
  ],
})

const User = mongoose.model('User', userSchema)

export default User
