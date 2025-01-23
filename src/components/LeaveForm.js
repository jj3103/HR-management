import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, AutoComplete, message, Divider, Row, Col, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LeaveData from './LeaveData';
import PrintLeaveForm from './PrintLeaveForm';
import moment from 'moment';
import '../css/LeaveForm.css';

const { Option } = Select;
const { TextArea } = Input;

const LeaveForm = () => {
    const [form] = Form.useForm();
    const [personnel, setPersonnel] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPersonnel, setSelectedPersonnel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [printModalVisible, setPrintModalVisible] = useState(false);
    const [submittedValues, setSubmittedValues] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [prefixDate, setPrefixDate] = useState(null);
    const [suffixDate, setSuffixDate] = useState(null);
    const [reportingDate, setReportingDate] = useState(null);

    useEffect(() => {
        if (searchTerm) {
            axios.get(`/personnelsearch?searchTerm=${searchTerm}`)
                .then(response => {
                    setPersonnel(response.data);
                })
                .catch(error => {
                    message.error('Failed to fetch personnel data');
                });
        } else {
            setPersonnel([]);
        }
    }, [searchTerm]);

    const handlePersonnelSelect = (value) => {
        const selectedPersonnel = personnel.find(p => p.service_number === value);
        if (selectedPersonnel) {
            form.setFieldsValue({
                personnel_id: selectedPersonnel.personnel_id,
                service_number: selectedPersonnel.service_number
            });
            setSelectedPersonnel(selectedPersonnel.personnel_id);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const formattedValues = {
                ...values,
                start_date: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
                end_date: endDate ? moment(endDate).format('YYYY-MM-DD') : null,
                prefix_on: prefixDate ? moment(prefixDate).format('YYYY-MM-DD') : null,
                suffix_on: suffixDate ? moment(suffixDate).format('YYYY-MM-DD') : null,
                reporting_date: reportingDate ? moment(reportingDate).format('YYYY-MM-DD') : null,
            };

            await axios.post('/api/leave', formattedValues);
            setSubmittedValues(formattedValues);
            setSuccessModalVisible(true);
        } catch (error) {
            message.error('Failed to create leave request');
        } finally {
            setLoading(false);
        }
    };

    const handleOk = () => {
        setSuccessModalVisible(false);
        form.resetFields();
        setSelectedPersonnel(null);
    };

    const handlePrint = () => {
        setSuccessModalVisible(false);
        setPrintModalVisible(true);
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (date && endDate) {
            calculateNumberOfDays(date, endDate);
        }
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        if (date && startDate) {
            calculateNumberOfDays(startDate, date);
        }
    };

    const calculateNumberOfDays = (startDate, endDate) => {
        if (startDate && endDate) {
            const days = moment(endDate).diff(moment(startDate), 'days') + 1; // Adding 1 to include both start and end date
            form.setFieldsValue({ no_of_days: days });
        }
    };

    const validateDates = (_, value) => {
        const startDate = form.getFieldValue('start_date');
        if (!startDate || !value) {
            return Promise.resolve();
        }
        if (moment(value).isBefore(startDate, 'day')) {
            return Promise.reject(new Error('End date must be after the start date'));
        }
        return Promise.resolve();
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
        <div className="leave-form-container">
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
              }}>Add Leave</Divider>
            <Row gutter={16}>
                <Col span={12}>
                    <Form
                        form={form}
                        onFinish={handleSubmit}
                        layout="vertical"
                        className="leave-form"
                        initialValues={{ reported_back: 'no', status: 'pending' }}
                        scrollToFirstError
                    >
                        <Form.Item
                            name="service_number"
                            label="Search Personnel"
                            rules={[{ required: true, message: 'Please select a personnel' }]}
                        >
                            <AutoComplete
                                options={personnel.map(p => ({
                                    value: p.service_number,
                                    label: `${p.first_name} ${p.last_name} (${p.service_number})`
                                }))}
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
                            <Col span={12}>
                                <Form.Item
                                    name="start_date"
                                    label="Start Date"
                                    rules={[{ required: true, message: 'Please select a start date' }]}
                                >
                                    <DatePicker
                                        selected={startDate}
                                        onChange={handleStartDateChange}
                                        dateFormat="yyyy-MM-dd"
                                        className="datepicker"
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
                                        { validator: validateDates }
                                    ]}
                                >
                                    <DatePicker
                                        selected={endDate}
                                        onChange={handleEndDateChange}
                                        dateFormat="yyyy-MM-dd"
                                        className="datepicker"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="prefix_on" label="Prefix On">
                                    <DatePicker
                                        selected={prefixDate}
                                        onChange={date => setPrefixDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        className="datepicker"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="suffix_on" label="Suffix On">
                                    <DatePicker
                                        selected={suffixDate}
                                        onChange={date => setSuffixDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        className="datepicker"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="reporting_date" label="Reporting Date">
                                    <DatePicker
                                        selected={reportingDate}
                                        onChange={date => setReportingDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        className="datepicker"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="no_of_days"
                            label="Number of Days"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter the number of days',
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || value > 0) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Number of days must be at least 1'));
                                    },
                                }),
                            ]}
                        >
                            <Input type="number" min="1" readOnly />
                        </Form.Item>

                        <Form.Item name="remarks" label="Remarks">
                            <TextArea rows={2} placeholder="Any special instructions or notes" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="reported_back"
                                    label="Reported Back"
                                    initialValue="no"
                                >
                                    <Select>
                                        <Option value="yes">Yes</Option>
                                        <Option value="no">No</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="leave_type"
                                    label="Leave Type"
                                    rules={[{ required: true, message: 'Please select a leave type' }]}
                                >
                                    <Select>
                                        <Option value="CL1">CL1</Option>
                                        <Option value="CL2">CL2</Option>
                                        <Option value="CL3">CL3</Option>
                                        <Option value="PAL">PAL</Option>
                                        <Option value="AL">AL</Option>
                                        <Option value="BAL">BAL</Option>
                                        <Option value="AAL">AAL</Option>
                                        <Option value="SICK LEAVE">SICK LEAVE</Option>
                                        <Option value="FUR LEAVE">FUR LEAVE</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="status" label="Status" initialValue="pending">
                                    <Select>
                                        <Option value="pending">Pending</Option>
                                        <Option value="approved">Approved</Option>
                                        <Option value="rejected">Rejected</Option>
                                        <Option value="absent">Absent</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="reporting_date" label="Reporting Date">
                                    <DatePicker
                                        selected={reportingDate}
                                        onChange={date => setReportingDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        className="datepicker"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                // Remove button disabling logic
                            >
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                    <Modal
                        title="Success"
                        visible={successModalVisible}
                        onOk={handleOk}
                        onCancel={handleOk}
                        footer={[
                            <Button key="print" type="primary" onClick={handlePrint}>
                                Print
                            </Button>,
                            <Button key="ok" onClick={handleOk}>
                                OK
                            </Button>,
                        ]}
                    >
                        <p>Your leave request has been submitted successfully.</p>
                    </Modal>

                    <Modal
                        title="Print Leave Form"
                        visible={printModalVisible}
                        onCancel={() => setPrintModalVisible(false)}
                        footer={null}
                        width="80%"
                    >
                        <PrintLeaveForm values={submittedValues} />
                    </Modal>
                </Col>

                <Col span={12}>
                    {selectedPersonnel && <LeaveData personnelId={selectedPersonnel} />}
                </Col>
            </Row>
        </div>
    );
};

export default LeaveForm;            
               
            

            

                    
