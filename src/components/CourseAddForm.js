import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const CourseAddForm = ({ show, handleClose }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');

  const handleAddCourse = () => {
    axios.post('/api/courses/addcourse', { name, duration })
      .then(response => {
        console.log('Course added successfully:', response.data);
        handleClose(); // Close the modal after adding course
      })
      .catch(error => {
        console.error('Error adding course:', error);
      });
  };
  

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Course</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formCourseName">
            <Form.Label>Course Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter course name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formDuration">
            <Form.Label>Duration</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleAddCourse}>
          Add Course
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CourseAddForm;
