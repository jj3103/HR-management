import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Select, Input, Button, message, Card, AutoComplete, Spin, Row, Col } from 'antd';
import '../css/PostingForm.css';

const { Option } = Select;

const AddPersonnelCourse = ({ onClose }) => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();
  const [personnel, setPersonnel] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        message.error('Failed to fetch courses');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courseSearchTerm) {
      const filtered = courses.filter((course) =>
        course.name.toLowerCase().includes(courseSearchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [courseSearchTerm, courses]);

  useEffect(() => {
    if (searchTerm) {
      axios
        .get(`/personnelsearch?searchTerm=${searchTerm}`)
        .then((response) => {
          setPersonnel(response.data);
        })
        .catch((error) => {
          console.error('Error fetching personnel:', error);
          message.error('Failed to fetch personnel');
        });
    } else {
      setPersonnel([]);
    }
  }, [searchTerm]);

  const handlePersonnelSelect = (value, option) => {
    const person = personnel.find((p) => p.personnel_id === option.key);
    setSelectedPersonnel(person);
  };

  const handleCourseSelect = (value, option) => {
    setSelectedCourseId(option.key);
  };

  const validateDates = () => {
    const startDate = form.getFieldValue('startDate');
    const endDate = form.getFieldValue('endDate');
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return Promise.reject(new Error('Start date cannot be after end date'));
    }
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    if (!selectedPersonnel) {
      message.error('Please select a personnel');
      return;
    }
    if (!selectedCourseId) {
      message.error('Please select a course');
      return;
    }

    const courseData = {
      serviceNumber: selectedPersonnel.service_number,
      courseId: selectedCourseId,
      startDate: values.startDate,
      endDate: values.endDate,
      grade: values.grade,
    };

    setSubmitLoading(true);

    try {
      const response = await axios.post('/api/courses/add', courseData);

      if (response.status === 200 || response.status === 201) {
        message.success('Course added successfully!');
        form.resetFields();
        onClose();
      } else {
        message.error('Failed to add course');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      message.error('Failed to add course');
    } finally {
      setSubmitLoading(false);
    }
  };

  const colors = {
    primary: '#1C3879', // Deep royal blue
    secondary: '#607D8B', // Blue grey
    background: '#F0F4F8', // Light blue-grey
    surface: '#FFFFFF', // White
    text: '#37474F', // Dark blue-grey
    accent: '#87CEEB', // Light blue
    delete: '#D32F2F', // Red for delete button
    edit: '#4B9F44', // Green for edit button
  };

  return (
    <div className="add-course-form">
      <Card
        title={
          <div style={{
            color: colors.primary,
            textAlign: 'center',
            marginBottom: '30px',
            fontWeight: 'bold',
            fontSize: '24px',
            borderColor: colors.primary,
            borderWidth: '2px',
            padding: '10px 0',
            textTransform: 'uppercase',
          }}>
            ASSIGN COURSE
          </div>
        }
        bordered={false}
        style={{
          maxWidth: '900px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          backgroundColor: colors.surface,
        }}
      >
        <Spin spinning={loadingCourses}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label="Search Personnel"
              rules={[{ required: true, message: 'Please search and select personnel' }]}
            >
              <AutoComplete
                options={personnel.map((p) => ({
                  value: `${p.first_name} ${p.last_name} (${p.service_number})`,
                  key: p.personnel_id,
                }))}
                onSearch={setSearchTerm}
                onSelect={handlePersonnelSelect}
                placeholder="Search by name or service number"
                style={{ width: '100%', fontSize: '16px' }} // Set font size for the input
              />
            </Form.Item>

            <Form.Item
              label="Search Course"
              rules={[{ required: true, message: 'Please select a course' }]}
            >
              <AutoComplete
                options={filteredCourses.map((course) => ({
                  value: course.name,
                  key: course.id,
                }))}
                onSearch={setCourseSearchTerm}
                onSelect={handleCourseSelect}
                placeholder="Search by course name"
                style={{ width: '100%', fontSize: '16px' }} // Set font size for the input
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[{ required: true, message: 'Please select start date' }]}
                >
                  <Input type="date" style={{ width: '100%', fontSize: '16px' }} /> {/* Increased font size */}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="End Date"
                  rules={[
                    { required: true, message: 'Please select end date' },
                    { validator: validateDates },
                  ]}
                >
                  <Input type="date" style={{ width: '100%', fontSize: '16px' }} /> {/* Increased font size */}
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="grade"
              label="Grade"
              rules={[{ required: true, message: 'Please enter grade' }]}
            >
              <Input placeholder="Enter grade" style={{ borderColor: colors.secondary, fontSize: '16px' }} /> {/* Increased font size */}
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitLoading} style={{ fontSize: '16px' }}>
                Add Course
              </Button>
              <Button onClick={onClose} style={{ marginLeft: 8, fontSize: '16px' }}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default AddPersonnelCourse;