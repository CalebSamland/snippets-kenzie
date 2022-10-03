import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Figure,
  InputGroup,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner, Post } from "components";
import { useProvideAuth } from "hooks/useAuth";
import { useRequireAuth } from "hooks/useRequireAuth";
import axios from "utils/axiosConfig.js";
import { AvatarPicker } from 'components/AvatarPicker'
import { toast } from "react-toastify";
import { FileUploader } from 'components/FileUploader'

const imgs = [
  'bird.svg',
  'dog.svg',
  'fox.svg',
  'frog.svg',
  'lion.svg',
  'owl.svg',
  'tiger.svg',
  'whale.svg',
]

const UserDetailPage = () => {
  const { state } = useProvideAuth();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [validated, setValidated] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAvatarPicker, setOpenAvatarPicker] = useState(false)
  const [profileImage, setProfileImage] = useState()
  const [data, setData] = useState({
    email: "",
    currentPassword: '',
    passwordError: '', 
    confirmPassword: '',
    password: "",
    isSubmitting: false,
    errorMessage: null,
  });

  let navigate = useNavigate();
  let params = useParams();
  const {
    state: { isAuthenticated },
  } = useRequireAuth();

  useEffect(() => {
    const getUser = async () => {
      try {
        const userResponse = await axios.get(`users/${params.uid}`);
        setUser(userResponse.data);
        setProfileImage(userResponse.data.profile_image)
        setLoading(false);
      } catch (err) {
        console.error(err.message);
      }
    };
    isAuthenticated && getUser();
  }, [params.uid, isAuthenticated]);

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };

  const handleUpdateAvatar = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    })

    try {
      const response = await axios.put(`/users/${user._id}`, { profileImage })
      
      // I get an annoying "something went wrong here" when I setUser 
      setUser(response.data)
      
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: null,
      })
      setOpenAvatarPicker(false)
    } catch (error) {
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: error.message
      })
    }
  }

  // -------------- upload custom avatar

  // const [ avatar, setAvatar] = useState();

  // const handleAvatarChange = (e) => {
  //   // setFile(e.target);
  //   console.log(e);
  //   setAvatar(e.target.files[0])
  // };

  // const handleUpload = (e) => {
  //   e.preventDefault();

    
  //   console.log("handleUpload is running");
    
  //   const formData = new formData();
  //   formData.append("file", avatar);
  //   formData.append("fileName", avatar.name);
    
  //   const options = {
  //     headers: {
  //       "content-type": "multipart/form-data",
  //     },
  //   };
  //   axios
  //   .post("/users", formData, options)
  //     .then((res, req) => {
  //       console.log(res);
  //       console.log('IS THIS RUNNING')
  //       setProfileImage(e.target.file[0]);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  // end custom avatar

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      setValidated(true);
      if (data.password !== data.confirmPassword) {
        setData({
          ...data,
          passwordError: 'Passwords need to match',
        })
      }
      return 
    }
      setData({
        ...data, 
        passwordError: null ,
        isSubmitting: true,
        errorMessage: null,
      });
    try { 
      const {
        user: { uid, username },
      } = state;

      
      const { currentPassword, password, confirmPassword } = data
      console.log(data.password, uid, username, confirmPassword, currentPassword)
      await axios.put(`/users/${uid}`, { confirmPassword, password, currentPassword })

      setValidated(false)

      toast.success("Successfully Update Password")
      setData({
        ...data,
        email: "",
        currentPassword: '',
        passwordError: '', 
        confirmPassword: '',
        password: "",
        isSubmitting: false,
        errorMessage: null,
      })
      setOpen(false)
    } catch (error) {
      if (error.message === 'Request failed with status code 400') {
        toast.error(error.response.data.message)
        setData({
          ...data,
          isSubmitting: false,
          errorMessage: error.response.data.message,
        })
      } else {
        setData({
          ...data,
          isSubmitting: false,
          errorMessage: error.message,
        })
      }
    }
  }


  if (!isAuthenticated) {
    return <LoadingSpinner full />;
  }

  if (loading) {
    return <LoadingSpinner full />;
  }

  return (
    <>
      <Container className="clearfix">
        <Button
          variant="outline-info"
          onClick={() => {
            navigate(-1);
          }}
          style={{ border: "none", color: "#E5E1DF" }}
          className="mt-3 mb-3"
        >
          Go Back
        </Button>
        <Card bg="header" className="text-center">
          <Card.Body>
            <Figure
              className="bg-border-color rounded-circle overflow-hidden my-auto ml-2 p-1"
              style={{
                height: "50px",
                width: "50px",
                backgroundColor: "white",
              }}
            >
              <Figure.Image src={user.profile_image} className="w-100 h-100" />
            </Figure>
            
            <Card.Title>{params.uid}</Card.Title>
            <Card.Subtitle>{user.email}</Card.Subtitle>

            
            {/* Avatar Picker */}

            {state.user.username === params.uid && (
              <div
                onClick={() => setOpenAvatarPicker(!openAvatarPicker)}
                style={{ cursor: "pointer", color: "#BFBFBF" }}
              >
                Edit Avatar
              </div>
            )}

            {openAvatarPicker && (
              <Container animation="false">
              <div className="row justify-content-center p-4">
                <div className="col text-center">
                    <Form
                      onSubmit={handleUpdateAvatar}
                    >
                      <AvatarPicker 
                        avatarOptions={imgs}
                        profileImage={profileImage}
                        setProfileImage={setProfileImage}
                      />
                      <Button type="submit" disabled={data.isSubmitting}>
                        {data.isSubmitting ? <LoadingSpinner /> : "Update"}
                      </Button>

                    </Form>

                  {/* Upload Custom Avatar */}
                
                    <FileUploader />

                  </div>
                </div>
              </Container>
            )}

            {/* Password Updater */}

            {state.user.username === params.uid && (
              <div
                onClick={() => setOpen(!open)}
                style={{ cursor: "pointer", color: "#BFBFBF" }}
              >
                Edit Password
              </div>
            )}

            {open && (
              <Container animation="false">
                <div className="row justify-content-center p-4">
                  <div className="col text-center">
                    <Form
                      noValidate
                      validated={validated}
                      onSubmit={handleUpdatePassword}
                    >

                      <Form.Group>
                        <Form.Label htmlFor="currentPassword">Current Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="currentPassword"
                          required
                          value={data.currentPassword}
                          onChange={handleInputChange}
                       />
                        <Form.Control.Feedback type="invalid">
                          Current password is required
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group>
                        <Form.Label htmlFor="password">New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          required
                          value={data.password}
                          onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type="invalid">
                          New Password is required
                        </Form.Control.Feedback>
                        <Form.Text id="passwordHelpBlock" muted>
                          Must be 8-20 characters long.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group>
                        <Form.Label htmlFor="confirmPassword">Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          pattern={data.password}
                          required
                          value={data.confirmPassword}
                          onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type="invalid">
                          {data.passwordError}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <br/>
                      {data.errorMessage && (
                        <span className="form-error">{data.errorMessage}</span>
                      )}
                      <Button type="submit" disabled={data.isSubmitting}>
                        {data.isSubmitting ? <LoadingSpinner /> : "Update"}
                      </Button>
                    </Form>
                  </div>
                </div>
              </Container>
            )}
          </Card.Body>
        </Card>
      </Container>
      <Container className="pt-3 pb-3">
        {user.posts.length !== 0 ? (
          user.posts.map((post) => (
            <Post key={post._id} post={post} userDetail />
          ))
        ) : (
          <div
            style={{
              marginTop: "75px",
              textAlign: "center",
            }}
          >
            No User Posts
          </div>
        )}
      </Container>
    </>
  );
};

export default UserDetailPage;
