import axios from "utils/axiosConfig";
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import {
  Button,
  InputGroup,
 } from "react-bootstrap";


export const FileUploader = ({ setProfileImage }) => {
  
  const [ avatar, setAvatar] = useState();

  const handleAvatarChange = (e) => {
    console.log(e);
    setAvatar(e.target.files[0])
  };

  const handleUpload = (e) => {
    e.preventDefault();

    
    console.log("handleUpload is running");
    
    const formData = new formData();
    formData.append("file", avatar);
    formData.append("fileName", avatar.name);
    
    const options = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axios
    .post("/users", formData, options)
      .then((res, req) => {
        console.log(res);
        console.log('IS THIS RUNNING')
        setProfileImage(e.target.file[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Form onSubmit={handleUpload}>
      
      <Form.Label>Upload your own Avatar</Form.Label>
      <InputGroup>
        <Form.Control 
          type='file'
          onChange={handleAvatarChange}
        />
      </InputGroup>
      <Button 
        type='submit'>Upload Avatar</Button>
    </Form>
  );
};

export default FileUploader;
