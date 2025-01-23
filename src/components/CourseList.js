import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Container, Collapse, Card, Modal, Form } from 'react-bootstrap';
import CourseAddForm from './CourseAddForm';
import { FullscreenOutlined, FullscreenExitOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm, message } from 'antd';
import moment from 'moment';

// Updated color palette for a professional and royal look
const colors = {
  primary: '#1C3879',     // Deep royal blue
  secondary: '#607D8B',   // Blue grey
  background: '#F0F4F8',  // Light blue-grey
  surface: '#FFFFFF',     // White
  text: '#37474F',        // Dark blue-grey
  accent: '#87CEEB',      // Amber (for special highlights)
  delete: '#D32F2F',      // Red for delete button
  edit: '#4B9F44',        // Green for edit button (like Defender car)
  expand: '#4FC3F7',      // Light blue for expand button
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [personnel, setPersonnel] = useState([]);
  const [open, setOpen] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showEditPersonnelModal, setShowEditPersonnelModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingPersonnel, setEditingPersonnel] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const formatDate = (value) => {
    return moment(value, moment.ISO_8601, true).isValid()
      ? moment(value).format('YYYY-MM-DD')
      : value;
  };
  

  const fetchCourses = () => {
    axios.get('/api/courses/all')
      .then(response => {
        setCourses(response.data);
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
      });
  };
  
  const fetchPersonnel = (courseId) => {
    axios.get(`/api/courses/${courseId}/personnel`)
      .then(response => {
        // Format start_date and end_date for each personnel
        const formattedPersonnel = response.data.map(person => ({
          ...person,
          start_date: formatDate(person.start_date),
          end_date: formatDate(person.end_date),
        }));
        
        setPersonnel(formattedPersonnel);
        setSelectedCourse(courseId);
        setOpen(!open);
      })
      .catch(error => {
        console.error('Error fetching personnel:', error);
      });
  };
  const handleShowAddCourseModal = () => setShowAddCourseModal(true);
  const handleCloseAddCourseModal = () => setShowAddCourseModal(false);

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowEditCourseModal(true);
  };

  const handleDeleteCourse = (courseId) => {
    axios.delete(`/api/courses/delete/${courseId}`)
      .then(() => {
        message.success('Course deleted successfully');
        fetchCourses();
      })
      .catch(error => {
        message.error('Error deleting course');
        console.error('Error deleting course:', error);
      });
  };

  const handleEditPersonnel = (person) => {
    const formattedStartDate = formatDate(person.start_date);
    const formattedEndDate = formatDate(person.end_date);
    
    setEditingPersonnel({
      ...person,
      start_date: formattedStartDate,
      end_date: formattedEndDate
    });
    setShowEditPersonnelModal(true);
  };
  

  const handleDeletePersonnel = (personId) => {
    axios.delete(`/api/courses/deletepersonnel/${personId}`)
      .then(() => {
        message.success('Personnel deleted successfully');
        fetchPersonnel(selectedCourse);  // Refresh personnel list after deletion
      })
      .catch(error => {
        message.error('Error deleting personnel');
        console.error('Error deleting personnel:', error);
      });
  };

  const handleEditCourseSubmit = () => {
    // API call to update the course information
    axios.put(`/api/courses/update/${editingCourse.id}`, editingCourse)
      .then(() => {
        message.success('Course updated successfully');
        setShowEditCourseModal(false);
        fetchCourses();
      })
      .catch(error => {
        message.error('Error updating course');
        console.error('Error updating course:', error);
      });
  };

  const handleEditPersonnelSubmit = () => {
    // API call to update the personnel information
    axios.put(`/api/courses/updatepersonnel/${editingPersonnel.id}`, editingPersonnel)
      .then(() => {
        message.success('Personnel updated successfully');
        setShowEditPersonnelModal(false);
        fetchPersonnel(selectedCourse);
      })
      .catch(error => {
        message.error('Error updating personnel');
        console.error('Error updating personnel:', error);
      });
  };

  return (
    <Container style={{ backgroundColor: colors.background, padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: colors.primary, marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>Course List</h1>
      <Button
      style={{
        backgroundColor: isHovered ? '#FFD700' : colors.accent, // Change background color on hover
        borderColor: colors.accent,
        color: colors.text,
        marginBottom: '20px',
        fontWeight: 'bold',
        borderRadius: '5px', // Add rounded corners for a modern look
        padding: '10px 20px', // Adjust padding for larger button size
        fontSize: '16px', // Increase font size for better readability
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Add a subtle shadow for depth
        transition: 'all 0.2s ease-in-out', // Enable smooth transitions for hover effects
      }}
      onMouseEnter={() => setIsHovered(true)} // Set hover state to true
      onMouseLeave={() => setIsHovered(false)} // Set hover state to false
      onClick={handleShowAddCourseModal}
    >
      Add Course
    </Button>
      <Table striped bordered hover responsive style={{ backgroundColor: colors.surface, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <thead style={{ backgroundColor: colors.primary, color: colors.surface }}>
          <tr>
            <th>Name</th>
            <th>Duration</th>
            <th>Personnel Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <React.Fragment key={course.id}>
              <tr>
                <td>{course.name}</td>
                <td>{course.duration}</td>
                <td>{course.personnel_count}</td>
                <td>
                  <Button
                    icon={<FullscreenOutlined />}
                    onClick={() => fetchPersonnel(course.id)}
                    style={{ marginRight: '5px', backgroundColor: colors.expand, borderColor: colors.expand, color: colors.text }}
                  />
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEditCourse(course)}
                    style={{ marginRight: '5px', backgroundColor: colors.edit, borderColor: colors.edit, color: colors.surface }}
                  />
                  <Popconfirm
                    title="Are you sure you want to delete this course?"
                    onConfirm={() => handleDeleteCourse(course.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      icon={<DeleteOutlined />}
                      style={{ backgroundColor: colors.delete, borderColor: colors.delete, color: colors.surface }}
                    />
                  </Popconfirm>
                </td>
              </tr>
              {selectedCourse === course.id && (
                <tr>
                  <td colSpan="4">
                    <Collapse in={open}>
                      <div>
                        <Card style={{ backgroundColor: colors.surface, border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          <Card.Body>
                            <Table striped bordered hover responsive style={{ backgroundColor: colors.surface }}>
                              <thead style={{ backgroundColor: colors.secondary, color: colors.surface }}>
                                <tr>
                                  <th>ID</th>
                                  <th>Service Number</th>
                                  <th>First Name</th>
                                  <th>Last Name</th>
                                  <th>Start Date</th>
                                  <th>End Date</th>
                                  <th>Grade</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {personnel.map(person => (
                                  <tr key={person.id}>
                                    <td>{person.id}</td>
                                    <td>{person.service_number}</td>
                                    <td>{person.first_name}</td>
                                    <td>{person.last_name}</td>
                                    <td>{person.start_date}</td>
                                    <td>{person.end_date}</td>
                                    <td>{person.grade}</td>
                                    <td>
                                      <Button
                                        icon={<EditOutlined />}
                                        onClick={() => handleEditPersonnel(person)}
                                        style={{ marginRight: '5px', backgroundColor: colors.edit, borderColor: colors.edit, color: colors.surface }}
                                      />
                                      <Popconfirm
                                        title="Are you sure you want to delete this personnel?"
                                        onConfirm={() => handleDeletePersonnel(person.id)}
                                        okText="Yes"
                                        cancelText="No"
                                      >
                                        <Button
                                          icon={<DeleteOutlined />}
                                          style={{ backgroundColor: colors.delete, borderColor: colors.delete, color: colors.surface }}
                                        />
                                      </Popconfirm>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </Card.Body>
                        </Card>
                      </div>
                    </Collapse>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>

      <CourseAddForm show={showAddCourseModal} handleClose={handleCloseAddCourseModal} />
      
      <Modal show={showEditCourseModal} onHide={() => setShowEditCourseModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: colors.primary, color: colors.surface }}>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: colors.surface }}>
          <Form>
            <Form.Group controlId="courseName">
              <Form.Label style={{ color: colors.text }}>Course Name</Form.Label>
              <Form.Control
                type="text"
                value={editingCourse?.name || ''}
                onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="courseDuration">
              <Form.Label style={{ color: colors.text }}>Duration</Form.Label>
              <Form.Control
                type="text"
                value={editingCourse?.duration || ''}
                onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleEditCourseSubmit}
              style={{ backgroundColor: colors.edit, borderColor: colors.edit, color: colors.surface, marginTop: '10px' }}
            >
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showEditPersonnelModal} onHide={() => setShowEditPersonnelModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: colors.primary, color: colors.surface }}>
          <Modal.Title>Edit Personnel</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: colors.surface }}>
          <Form>
      <Form.Group controlId="personnelFirstName">
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          value={editingPersonnel?.first_name || ''}
          readOnly // Non-editable
        />
      </Form.Group>
      <Form.Group controlId="personnelLastName">
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          value={editingPersonnel?.last_name || ''}
          readOnly // Non-editable
        />
      </Form.Group>
      <Form.Group controlId="personnelGrade">
        <Form.Label>Grade</Form.Label>
        <Form.Control
          type="text"
          value={editingPersonnel?.grade || ''}
          onChange={(e) => setEditingPersonnel({ ...editingPersonnel, grade: e.target.value })}
        />
      </Form.Group>
      <Form.Group controlId="personnelStartDate">
        <Form.Label>Start Date</Form.Label>
        <Form.Control
          type="date"
          value={editingPersonnel?.start_date || ''}
          onChange={(e) => setEditingPersonnel({ ...editingPersonnel, start_date: e.target.value })}
        />
      </Form.Group>
      <Form.Group controlId="personnelEndDate">
        <Form.Label>End Date</Form.Label>
        <Form.Control
          type="date"
          value={editingPersonnel?.end_date || ''}
          onChange={(e) => setEditingPersonnel({ ...editingPersonnel, end_date: e.target.value })}
        />
      </Form.Group>
      <Button
              variant="primary"
              onClick={handleEditPersonnelSubmit}
              style={{ backgroundColor: colors.edit, borderColor: colors.edit, color: colors.surface, marginTop: '10px' }}
            >
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CourseList;