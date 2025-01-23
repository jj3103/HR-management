import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, AutoComplete, message, Typography, Divider, Spin, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import _ from 'lodash';
import '../css/PostingForm.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

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


const PostingForm = () => {
    const [form] = Form.useForm();
    const [personnel, setPersonnel] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchPersonnel = useCallback(_.debounce((term) => {
        if (term) {
            setLoading(true);
            axios.get(`/personnelsearch`, { params: { searchTerm: term } })
                .then(response => {
                    setPersonnel(response.data);
                })
                .catch(error => {
                    console.error('Error fetching personnel data:', error);
                    message.error('Failed to fetch personnel data');
                })
                .finally(() => setLoading(false));
        } else {
            setPersonnel([]);
        }
    }, 500), []);

    useEffect(() => {
        fetchPersonnel(searchTerm);
    }, [searchTerm, fetchPersonnel]);

    const handlePersonnelSelect = (value) => {
        const selectedPersonnel = personnel.find(p => p.service_number === value);
        if (selectedPersonnel) {
            form.setFieldsValue({
                personnel_id: selectedPersonnel.personnel_id,
                service_number: selectedPersonnel.service_number
            });
        }
    };

    const handleSubmit = (values) => {
        setLoading(true);
        axios.post('/postings', values)
            .then(response => {
                message.success('Posting created successfully!');
                form.resetFields();
            })
            .catch(error => {
                console.error('Error creating posting:', error);
                message.error('Failed to create posting');
            })
            .finally(() => setLoading(false));
    };

    const calculateNumberOfDays = () => {
        const startDate = form.getFieldValue('start_date');
        const endDate = form.getFieldValue('end_date');
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            form.setFieldsValue({ no_of_days: diffDays });
        }
    };

    return (
        <div className="posting-form-container">
            <Divider className="divider"
             style={{ 
                color: colors.primary, 
                textAlign: 'center', 
                marginBottom: '50px', 
                fontWeight: 'bold', 
                fontSize: '24px', // Font size
                borderColor: colors.primary, // Matches text color
                borderWidth: '2px', // Thicker border
                padding: '10px 0', // Vertical padding for better spacing
                textTransform: 'uppercase', // Make the text uppercase for emphasis
              }}
            >Add Posting</Divider>
            {loading && <Spin size="large" className="loading-spinner" />}
            <Form form={form} onFinish={handleSubmit} layout="vertical" className="posting-form">
                <Form.Item
                    name="service_number"
                    label="Search Personnel"
                    rules={[{ required: true, message: 'Please select a personnel' }]}
                >
                    <AutoComplete
                        options={personnel.map(p => ({ value: p.service_number, label: `${p.first_name} ${p.last_name} (${p.service_number})` }))}
                        onSelect={handlePersonnelSelect}
                        onSearch={setSearchTerm}
                        placeholder="Search by name or service number"
                        className="search-autocomplete"
                    >
                        <Input prefix={<SearchOutlined />} />
                    </AutoComplete>
                </Form.Item>

                <Form.Item name="personnel_id" hidden>
                    <Input />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="posted_to"
                            label="Posted To"
                            rules={[{ required: true, message: 'Please enter the posting location' }]}
                        >
                            <Input className="input-field" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="start_date" 
                            label="Start Date" 
                            rules={[{ required: true, message: 'Please select a start date' }]}
                        >
                            <Input 
                                type="date" 
                                className="date-input"
                                onChange={() => calculateNumberOfDays()}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="end_date"
                            label="End Date"
                            dependencies={['start_date']}
                            rules={[
                                { required: true, message: 'Please select an end date' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const startDate = getFieldValue('start_date');
                                        if (startDate && value && value < startDate) {
                                            return Promise.reject(new Error('End date cannot be before start date'));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <Input 
                                type="date" 
                                className="date-input"
                                onChange={() => calculateNumberOfDays()}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="prefix_date" label="Prefix Date">
                            <Input type="date" className="date-input" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="suffix_date" label="Suffix Date">
                            <Input type="date" className="date-input" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="no_of_days"
                            label="Number of Days"
                            rules={[
                                { required: true, message: 'Please enter the number of days' },
                                { validator: (_, value) => {
                                    if (value && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
                                        return Promise.reject(new Error('Number of days must be a positive integer'));
                                    }
                                    return Promise.resolve();
                                }}
                            ]}
                        >
                            <Input type="number" className="input-field" readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="remarks" label="Remarks">
                            <TextArea rows={4} className="textarea" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="reported_back" label="Reported Back" initialValue="no">
                            <Select className="select-field">
                                <Option value="yes">Yes</Option>
                                <Option value="no">No</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="reporting_date" label="Reporting Date">
                            <Input type="date" className="date-input" />
                        </Form.Item>
                    </Col>
                </Row>
                {/* New Fields */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="type_of_wt" label="Type of WT">
                            <Input className="input-field" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="report_to" label="Report To">
                            <Input className="input-field" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="rum_and_cig_allowance_paid_upto" label="Rum and Cig Allowance Paid Upto">
                            <Input className="input-field" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="type_of_arms" label="Type of Arms">
                            <Input className="input-field" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="arms_regd_no" label="Arms Regd No">
                            <Input className="input-field" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="party_of" label="Party Of">
                            <Input className="input-field" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="cea_and_cilq_pub_upto" label="CEA and CILQ Pub Upto">
                            <Input className="input-field" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="auth" label="Auth">
                            <Input className="input-field" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="extra_copy_to" label="Extra Copy To">
                            <Input className="input-field" />
                        </Form.Item>
                    </Col>
                </Row>
                {/* End of New Fields */}

                

                <Form.Item>
                <Button type="primary" htmlType="submit">
    Submit
</Button>

                </Form.Item>
            </Form>
        </div>
    );
};

export default PostingForm;
