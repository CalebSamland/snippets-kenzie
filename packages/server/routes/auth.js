import express from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models'
import keys from '../config/keys'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.route('/').get((req, res, next) => {
  res.send('auth endpoint')
})

router.post('/signup', async (req, res) => {
  const { username, password, confirmPassword, profile_image, email} = req.body

  if (!password || !username) {
    return res.status(422).json({ error: 'please add all the fields' })
  } else if (password !== confirmPassword) {
    return res.status(422).json({ error: 'Passwords must match' })
  } else if (password.length < 8 || password.length > 20) {
    return res.status(400).json({ error: 'Password must be between 8 and 20 characters in length '})
  }

  User.findOne({ username: username })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: 'user already exists with that name' })
      }
      bcrypt.hash(password, 12).then((hashedpassword) => {
        const user = new User({
         email,
          username,
          passwordHash: hashedpassword,
          profile_image: profile_image,
        })

        user
          .save()
          .then((user) => {
            res.json({ message: 'saved successfully' })
          })
          .catch((err) => {
            if(err.name === 'ValidationError') {
              res.status(422).json({ message: 'Invalid Email Format' })
            } else {
              res.status(400).json(err)
            }
          })
      })
    })
    .catch((err) => {
      res.status(400).json(err)
    })
})

router.put('signup', async (req, res) => {

})

router.post('/signin', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(422).json({ error: 'missing username or password' })
  }

  const user = await User.findOne({ username: username })
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password',
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, keys.jwt.secret)
  res
    .status(200)
    .send({ token, username, uid: user.id, profile_image: user.profile_image, email: user.email })
})

module.exports = router
