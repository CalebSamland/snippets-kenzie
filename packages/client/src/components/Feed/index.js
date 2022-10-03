import React, { useState, useEffect } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import axios from 'utils/axiosConfig.js'
import { Post } from 'components'
import LoadingSpinner from 'components/LoadingSpinner'
import { useProvideAuth } from 'hooks/useAuth'
import { toast } from 'react-toastify'
import Fuse from 'fuse.js'

const initialState = {
  postText: '',
  isSubmitting: false,
  errorMessage: null,
}

const Feed = () => {
  const {
    state: { user },
  } = useProvideAuth()
  const [posts, setPosts] = useState(null)
  const [postLoading, setPostLoading] = useState(true)
  const [postError, setPostError] = useState(false)

  const [data, setData] = useState(initialState)
  const [validated, setValidated] = useState(false)

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    })
  }
  const handleSearch = (e) => {

    // as search is changing, it should be filtering 'posts' and calling setPosts()
    // based on if a post text contains the fuzzy (fuse.js) search text

    // Adding the searched string into data
    setData({ // adding a "search": 
      ...data,
      [e.target.name]: e.target.value // search: "the query string"
    })

    console.log(data)

    // Taking the query and returning the posts that match using Fuse.js
    let query = e.target.value // the user input search  ------------------------!!!! this is what I need to improve
    const fuse = new Fuse(posts, { // the list of posts to search
      keys: ["text"] // the key / value pair to search in... the post text
    })
    let result = fuse.search(query)
    result = result.map(fuseItem => fuseItem.item)

    // figure out a way to setPosts back to allPosts after every query search change
    setPosts(result)

  }

  const handlePostSubmit = async (event) => {
    const form = event.currentTarget
    event.preventDefault()
    if (form.checkValidity() === false) {
      toast.error('Post text is required');
      setValidated(true)
      return
    }

    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    })

    axios
      .post('/posts', {
        text: data.postText,
        author: user.username,
      })
      .then(
        (res) => {
          setData(initialState)
          setPosts((posts) => [
            {
              ...res.data,
              author: {
                username: user.username,
                profile_image: user.profile_image,
              },
            },
            ...posts,
          ])
          setValidated(false)
        },
        (error) => {
          setData({
            ...data,
            isSubmitting: false,
            errorMessage: error.message,
          })
        }
      )
  }

  useEffect(() => {
    const getPosts = async () => {
      try {
        const allPosts = await axios.get('posts')
        setPosts(allPosts.data)
        setPostLoading(false)
      } catch (err) {
        console.error(err.message)
        setPostLoading(false)
        setPostError(true)
      }
    }
    getPosts()
  }, [])

  return (
    <>
      <Container className='pt-3 pb-3 clearfix'>
        <Form.Group>
          <Form.Control
            type='search'
            id='search'
            placeholder='Search posts'
            as='textarea'
            rows={1}
            maxLength='120'
            name='searchText'
            aria-describedby='post-form'
            size='lg'
            value={data.searchText}
            onChange={handleSearch}
          />
        </Form.Group>
        <h4>Share a Snip</h4>
        <Form
          noValidate
          validated={validated}
          onSubmit={handlePostSubmit}
        >
          <Form.Control
            as='textarea'
            rows={3}
            maxLength='120'
            name='postText'
            placeholder="What's on your mind?"
            aria-describedby='post-form'
            size='lg'
            required
            value={data.postText}
            onChange={handleInputChange}
          />

          {data.errorMessage && (
            <span className='form-error'>{data.errorMessage}</span>
          )}
          <Button
            className='float-right mt-3'
            type='submit'
            disabled={data.isSubmitting}
          >
            {data.isSubmitting ? <LoadingSpinner /> : 'Post'}
          </Button>
        </Form>
      </Container>

      {!postLoading ? (
        <Container
          className='pt-3 pb-3'
        >
          <h6>Recent Snips</h6>
          {postError && 'Error fetching posts'}
          {posts &&
            posts.map((post) => <Post key={post._id} post={post} />)}
        </Container>
      ) : (
        <LoadingSpinner full />
      )}
    </>
  )
}

export default Feed;