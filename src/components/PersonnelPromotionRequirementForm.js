import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Row, Col, Select, message, Card } from 'antd';
import '../css/PersonnelPromotionRequirementForm.css';

const { Option } = Select;
const { TextArea } = Input;

const PersonnelPromotionRequirementForm = () => {
    const [rank, setRank] = useState('');
    const [qualificationIds, setQualificationIds] = useState([]);
    const [courseIds, setCourseIds] = useState([]);
    const [yearsOfExperience, setYearsOfExperience] = useState('');
    const [currentRank, setCurrentRank] = useState('');
    const [remarks, setRemarks] = useState('');
    const [qualifications, setQualifications] = useState([]);
    const [courses, setCourses] = useState([]);
    const [ranks, setRanks] = useState([]);

    useEffect(() => {
        axios.get('/api/qualifications')
            .then(response => setQualifications(response.data))
            .catch(error => console.error('Error fetching qualifications:', error));

        axios.get('/api/courses')
            .then(response => setCourses(response.data))
            .catch(error => console.error('Error fetching courses:', error));

        axios.get('/api/promotion/posts')
            .then(response => setRanks(response.data))
            .catch(error => console.error('Error fetching posts:', error));
    }, []);

    const handleSubmit = (values) => {
        axios.post('/api/promotion/requirements', values)
            .then(response => {
                message.success('Promotion requirement added successfully!');
                // Reset form
                form.resetFields();
            })
            .catch(error => {
                console.error('Error adding promotion requirement:', error);
                message.error('Error adding promotion requirement. Please try again.');
            });
    };
    const colors = {
        primary: '#1C3879',     // Deep royal blue
        secondary: '#607D8B',   // Blue grey
        background: '#F0F4F8',  // Light blue-grey
        surface: '#FFFFFF',     // White
        text: '#37474F',        // Dark blue-grey
        accent: '#87CEEB',      // Light blue
        delete: '#D32F2F',      // Red for delete button
        edit: '#4B9F44',        // Green for edit button
      };

    return (
        <div className="promotion-requirement-form-container">
            <Card title={
    <div style={{ 
        color: colors.primary, 
        textAlign: 'center', 
        marginBottom: '30px', 
        fontWeight: 'bold', 
        fontSize: '24px', // Font size
        borderColor: colors.primary, // Matches text color
        borderWidth: '2px', // Thicker border
        padding: '10px 0', // Vertical padding for better spacing
        textTransform: 'uppercase', // Make the text uppercase for emphasis
      }}>
     Personnel Promotion Requirement Form
    </div>
  }
     bordered={false} style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        rank: '',
                        qualificationIds: [],
                        courseIds: [],
                        yearsOfExperience: '',
                        currentRank: '',
                        remarks: '',
                    }}
                >
                    <Form.Item
                        label="Rank"
                        name="rank"
                        rules={[{ required: true, message: 'Please select a rank' }]}
                    >
                        <Select
                            placeholder="Select rank"
                            onChange={(value) => setRank(value)}
                        >
                            {ranks.map(rank => (
                                <Option key={rank.id} value={rank.rank_name}>
                                    {rank.rank_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Qualifications"
                        name="qualificationIds"
                        rules={[{ required: true, message: 'Please select at least one qualification' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select qualifications"
                            onChange={(values) => setQualificationIds(values)}
                        >
                            {qualifications.map(qualification => (
                                <Option key={qualification.id} value={qualification.id}>
                                    {qualification.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Courses"
                        name="courseIds"
                        rules={[{ required: true, message: 'Please select at least one course' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select courses"
                            onChange={(values) => setCourseIds(values)}
                        >
                            {courses.map(course => (
                                <Option key={course.id} value={course.id}>
                                    {course.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Years of Experience"
                        name="yearsOfExperience"
                        rules={[{ required: true, message: 'Please enter years of experience' }]}
                    >
                        <Input
                            type="number"
                            placeholder="Enter years of experience"
                            onChange={(e) => setYearsOfExperience(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Current Rank"
                        name="currentRank"
                        rules={[{ required: true, message: 'Please select the current rank' }]}
                    >
                        <Select
                            placeholder="Select current rank"
                            onChange={(value) => setCurrentRank(value)}
                        >
                            {ranks.map(rank => (
                                <Option key={rank.id} value={rank.rank_name}>
                                    {rank.rank_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Remarks"
                        name="remarks"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter any remarks"
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default PersonnelPromotionRequirementForm;
