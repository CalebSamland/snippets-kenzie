import express from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models'
import { requireAuth } from '../middleware'
import fileUpload from 'express-fileupload'
import path from 'path'

const router = express.Router()

router
  .route('/:id')
  .get(async (request, response) => {
    const populateQuery = [
      {
        path: 'posts',
        populate: { path: 'author', select: ['username', 'profile_image'] },
      },
    ]

    const user = await User.findOne({ username: request.params.id })
      .populate(populateQuery)
      .exec()
    if (user) {
      response.json(user.toJSON())
    } else {
      response.status(404).end()
    }
  })
  .put(requireAuth, async (request, response) => { // This Code was based off of Guilia's code
    const { currentPassword, password, confirmPassword, profileImage } = request.body
    const { id } = request.params

    if (request.user.id != id) return response.status(401).json({ message: 'Unauthorized' })

    if (password && currentPassword && confirmPassword) {
      const user = await User.findById({ _id: id })

      const passwordMatchesHashed = await bcrypt.compare(currentPassword, user.passwordHash)
      
      if (!passwordMatchesHashed) {
        return response.status(401).json( { message: 'Current Password does not match' })
      } else if (password !== confirmPassword) {
        return response.status(422).json( { message: 'Passwords do not match' })
      } else if (password.length < 8 || password.length > 20) {
        return response.status(400).json( { message: 'Password must be between 8 and 20 characters' } )
      }

      const hashedpassword = await bcrypt.hash(password, 12)
      
      try {
          const userUpdate = await User.findByIdAndUpdate(
            {
              _id: id,
            },
            {
              passwordHash: hashedpassword,
            },
            {
              new: true,
            }
          )
          response.json(userUpdate.toJSON())
        } catch (error) {
          console.log(error)
          response.status(404).end()
        }
    } else if (profileImage) {

      try {
        const userUpdate = await User.findByIdAndUpdate(
          {
            _id: id,
          },
          {
            profile_image: profileImage,
          },
          {
            new: true,
          }
        )
        
        response.json(userUpdate.toJSON())
      } catch (error) {
        console.log(error)
        response.status(404).end()
      }
    }
    response.status(404).end()
  })


router.route('/').post(fileUpload(), async (req, res) => {

    console.log(req.files)
  
    if(!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "no files uploaded" })
    }

    const receivedFile = req.files.file
    console.log(receivedFile)

    const uploadPath = 
      path.join(__dirname, '../') + 'public/' + receivedFile.name

      receivedFile.mv(uploadPath, function(err) {
        if (err) {
          return res.status(400).json( {error: err })
        }
        return res.status(200).json({ message: 'File Sucessfully Uploaded' })
      })

})

module.exports = router
