import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Form,
  Button,
  Media,
  Figure,
  ListGroup,
  Modal,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useProvideAuth } from 'hooks/useAuth'
import axios from 'utils/axiosConfig.js'
import { timeSince } from 'utils/timeSince'
import { LikeIcon, LikeIconFill, ReplyIcon, TrashIcon } from 'components'
import './Post.scss'
import { toast } from 'react-toastify'

const initialState = {
  commentText: '',
  isSubmitting: false,
  errorMessage: null,
}

const Post = ({
  post: { _id, author, profile_image, text, comments, created, likes },
  detail,
userDetail
}) => {
  const [data, setData] = useState(initialState)
  const [validated, setValidated] = useState(false)
  const [stateComments, setStateComments] = useState(comments)
  let navigate = useNavigate();
  const {
    state: { user },
  } = useProvideAuth()
  const [likedState, setLiked] = useState(likes.includes(user.uid))
  const [likesState, setLikes] = useState(likes.length)

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    })
  }

  const handleToggleLike = async () => {
    if (!likedState) {
      setLiked(true)
      setLikes(likesState + 1)
      try {
        await axios.post(`posts/like/${_id}`)
      } catch (error) {
        console.log(error)
        return error
      }
    } else {
      setLiked(false)
      setLikes(likesState - 1)
      try {
        await axios.post(`posts/like/${_id}`)
      } catch (error) {
        console.log(error)
        return error
      }
    }
  }

  // Complete function to call server endpoint /posts/:id
  // with delete request


  // control showing of the delet modal window
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  // ---- modal window


  const handleDeletePost = async () => {
    handleClose() // closes the modal window

    console.log('Trying to delete post:', _id)


    try {
        await axios.delete(`posts/${_id}`, { data: { userId: user.uid } } )
        console.log('Deleted post', _id)
        
      } catch(error) {
          console.log(error)
          return error
        }
        toast.success("Post Deleted", {
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
        })
  }


  const handleCommentSubmit = async (event) => {
    const form = event.currentTarget
    event.preventDefault()
    event.stopPropagation()
    if (form.checkValidity() === false) {
      toast.error('Comment text is required')
      setValidated(true)
      return
    }

    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    })

    axios
      .put('/posts/comments', {
        text: data.commentText,
        userId: user.uid,
        postId: _id,
      })
      .then(
        ({ data }) => {
          setData(initialState)
          setStateComments(data.comments)
          setValidated(false)
        },
        (error) => {
          console.log('axios error', error)
        }
      )
  }

  useEffect(() => {
    setStateComments(comments)
  }, [comments])


  return (
    <>
      <ListGroup.Item
        className='bg-white text-danger px-3 rounded-edge'
        as={'div'}
        key={_id}
      >
        <Media className='w-100 d-flex gap-3'>
          <Figure
            className='mr-4 bg-border-color rounded-circle overflow-hidden ml-2 p-1'
            style={{ height: '60px', width: '60px', marginTop: '0px'}}
          >
            {/* Add <Link> Here */}
            <Link to={`u/${author.username}`}><Figure.Image src={author.profile_image} className='w-100 h-100 mr-4' /> </Link>
          </Figure>
          <Media.Body className='w-100'>
            <div className='d-flex align-items-center'>
              {/* Add <Link Here */}
              <Link to={`u/${author.username}`}>
                <span className='text-muted mr-1 username'>@{author.username}</span>
              </Link>
              <pre className='m-0 text-muted'>{' - '}</pre>
              <span className='text-muted'>{timeSince(created)} ago</span>
            </div>
            <div className='mb-n1 mt-1 position-relative'>
              <blockquote className='mb-1 mw-100'>
                <div className='mw-100 overflow-hidden'>
                  {text}
                </div>
              </blockquote>
            </div>

            <div className='d-flex justify-content-end align-items-bottom'>
              <div className='d-flex align-items-center'>
                {user.username === author.username && (
                  <Container className='close'>
                    <TrashIcon onClick={handleShow} /> {/* onClick={handleDeletePost} */}

                  {/* THis is where the modal window is, that displays when trash is clicked */}
                    <Modal show={show} onHide={handleClose}>
                      <Modal.Header>
                        <Modal.Title style={{color: 'black'}}>Are you sure you want to delete this post?</Modal.Title> {/* had to force the syling here */}
                      </Modal.Header>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                        <Button variant="primary" onClick={handleDeletePost}>Delete</Button>
                      </Modal.Footer>
                    </Modal>
                  </Container>
                )}
              </div>

              <div className='d-flex align-items-center mr-2'>
                <Button
                  variant='link'
                  size='md'
                  onClick={() => navigate(`/p/${_id}`)}
                >
                  <ReplyIcon />
                </Button>
                <span>{comments.length > 0 ? comments.length : 0}</span>
              </div>

                {/* TOOLTIP TO SHOW USER WHO LIKE THE POST */}

              {
                <OverlayTrigger
                  key={1}
                  placement={'top'}
                  overlay={
                    <Tooltip id={'tooltip-top'}>
                      <Container>
                        {
                          likes.map((like, index) => (
  
                          <div className='row my-3 align-items-center' key={index} style={{flexWrap: "nowrap"}}>
                            
                            <span>{like.username}</span>
                          </div>
                        ))}
                      </Container>
                    </Tooltip>
                  }
                >
                  <div
                className={`d-flex align-items-center mr-3 ${
                  likedState ? 'isLiked' : ''
                }`}
              >

                <Button variant='link' size='md' onClick={handleToggleLike}>
                  {likedState ? <LikeIconFill /> : <LikeIcon />}
                </Button>
                <span>{likesState}</span>
              </div>
                  {/* <Button variant="secondary">Tooltip on top</Button> */}
                </OverlayTrigger>
              }
              
            </div>
          </Media.Body>
        </Media>
      </ListGroup.Item>
      {detail && (
        <div>
          <br />
          <Form noValidate validated={validated} onSubmit={handleCommentSubmit} className="clearfix">
            <Form.Control
              type='text'
              size='md'
              name='commentText'
              maxLength='120'
              placeholder='Reply'
              aria-describedby='comment-input'
              required
              value={data.commentText}
              onChange={handleInputChange}
            />
              <Button
                className='float-right mt-3'
                type='submit'
              >Comment</Button>
            <Form.Control.Feedback type='invalid' className="text-warning">
              Comment text is required
            </Form.Control.Feedback>

            {data.errorMessage && (
              <span className='form-error'>{data.errorMessage}</span>
            )}
          </Form>
          {!stateComments.length > 0 ? (
            <div>no comments</div>
          ) : (
            <Container>
              {stateComments.map((c, index) => (
                <div className='row my-3 align-items-center' key={index} style={{flexWrap: "nowrap"}}>
                  <Figure
                    className='mr-4 bg-white rounded-circle overflow-hidden my-auto ml-2'
                    style={{ height: '40px', flexBasis: '40px', minWidth: "40px" }}
                  >
                    <Figure.Image
                      src={c.author?.profile_image}
                      style={{height: '40px', width: '40px'}}
                    />
                  </Figure>
                  <span>{c.text}</span>
                  <span>{timeSince(c.created)} ago</span>
                </div>
              ))}
            </Container>
          )}
        </div>
      )}
    </>
  )
}

export default Post;