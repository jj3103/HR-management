import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, DatePicker, Select} from 'antd';
import { SearchOutlined, FilterOutlined, ExportOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/UserTable.css';
import moment from 'moment';

const { Option } = Select;

// Color scheme for a professional look
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
  

const PostingTable = () => {
    const [postings, setPostings] = useState([]);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedPosting, setSelectedPosting] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sorterInfo, setSorterInfo] = useState({});

    const pageSize = 50;

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (event) => {
        setSearchText(event.target.value);
    };

    const handleShow = (posting) => {
        setSelectedPosting(posting);
        setShow(true);
    };

    const handleClose = () => setShow(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedPosting(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = () => {
        if (!selectedPosting) return;
    
        const formattedPosting = {
            ...selectedPosting,
            start_date: selectedPosting.start_date,
            end_date: selectedPosting.end_date,
            prefix_date: selectedPosting.prefix_date,
            suffix_date: selectedPosting.suffix_date,
            reporting_date: selectedPosting.reporting_date
        };
    
        // Change here: Use `id` instead of `personnel_id`
        axios.put(`/postings/${selectedPosting.id}`, formattedPosting)
            .then(response => {
                setPostings(prev => prev.map(post => post.id === selectedPosting.id ? formattedPosting : post));
                setShow(false);
            })
            .catch(error => {
                console.error('Error updating posting:', error);
                alert(`Error updating posting: ${error.message}`);
            });
    };

    const handleFilter = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSorterInfo(sorter);
    };

    const filteredPostings = postings.filter(posting =>
        posting.name.toLowerCase().includes(searchText.toLowerCase()) ||
        posting.posted_to.toLowerCase().includes(searchText.toLowerCase()) ||
        (posting.remarks && posting.remarks.toLowerCase().includes(searchText.toLowerCase()))
    );
    const handleDelete = (id, name, posted_to, start_date, end_date) => {
        // Create a confirmation message
        const confirmDelete = window.confirm(
            `Are you sure you want to permanently delete the posting record for ${name}, assigned to ${posted_to}, from ${start_date} to ${end_date}?`
        );
    
        // Proceed only if the user confirmed the deletion
        if (confirmDelete) {
            // Perform the delete operation
            axios.delete(`/postings/delete/${id}`)
                .then(response => {
                    // Update postings state to remove the deleted posting
                    setPostings(prev => prev.filter(post => post.id !== id));
                    alert('Posting deleted successfully');
                })
                .catch(error => {
                    console.error('Error deleting posting:', error);
                    alert(`Error deleting posting: ${error.message}`);
                });
        }
    };
    

    const titleStyle = {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: '16px', // Adjust the font size as needed
        letterSpacing: '0.5px', // Adds space between letters for better readability
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
        textTransform: 'uppercase', // Makes the text uppercase for a strong effect
    };
    

const columns = [
    {
        title: <span style={titleStyle}>Posting ID</span>,
        dataIndex: 'id',
        key: 'posting_id',
        sorter: (a, b) => a.id - b.id,
        sortDirections: ['ascend', 'descend'],
    },
    {
        title: <span style={titleStyle}>Name</span>,
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ['ascend', 'descend'],
        render: (text, record) => (
            <Space>
                <img src={`https://ui-avatars.com/api/?name=${text}&background=random`} alt={text} className="avatar" />
                {text}
            </Space>
        ),
        filters: [...new Set(postings.map(post => ({ text: post.name, value: post.name })))],
        onFilter: (value, record) => record.name.includes(value),
        filteredValue: filteredInfo.name || null,
    },
    {
        title: <span style={titleStyle}>Posted To</span>,
        dataIndex: 'posted_to',
        key: 'posted_to',
        sorter: (a, b) => a.posted_to.localeCompare(b.posted_to),
        sortDirections: ['ascend', 'descend'],
        filters: [...new Set(postings.map(post => ({ text: post.posted_to, value: post.posted_to })))],
        onFilter: (value, record) => record.posted_to.includes(value),
        filteredValue: filteredInfo.posted_to || null,
    },
    {
        title: <span style={titleStyle}>Start Date</span>,
        dataIndex: 'start_date',
        key: 'start_date',
        sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
        sortDirections: ['ascend', 'descend'],
        render: (text) => text ? moment(text).format('YYYY-MM-DD') : '',
        filterDropdown: () => (
            <div style={{ padding: 8 }}>
                <DatePicker
                    onChange={(date) => setFilteredInfo(prev => ({ ...prev, start_date: date ? [date.format('YYYY-MM-DD')] : null }))}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
            </div>
        ),
        onFilter: (value, record) => record.start_date && record.start_date.includes(value),
        filteredValue: filteredInfo.start_date || null,
    },
    {
        title: <span style={titleStyle}>End Date</span>,
        dataIndex: 'end_date',
        key: 'end_date',
        sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
        sortDirections: ['ascend', 'descend'],
        render: (text) => text ? moment(text).format('YYYY-MM-DD') : '',
        filterDropdown: () => (
            <div style={{ padding: 8 }}>
                <DatePicker
                    onChange={(date) => setFilteredInfo(prev => ({ ...prev, end_date: date ? [date.format('YYYY-MM-DD')] : null }))}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
            </div>
        ),
        onFilter: (value, record) => record.end_date && record.end_date.includes(value),
        filteredValue: filteredInfo.end_date || null,
    },
    {
        title: <span style={titleStyle}>Number of Days</span>,
        dataIndex: 'no_of_days',
        key: 'no_of_days',
        sorter: (a, b) => (a.no_of_days || 0) - (b.no_of_days || 0),
        sortDirections: ['ascend', 'descend'],
        filterDropdown: () => (
            <div style={{ padding: 8 }}>
                <Input
                    type="number"
                    placeholder="Filter Number of Days"
                    onChange={(e) => setFilteredInfo(prev => ({ ...prev, no_of_days: e.target.value ? [e.target.value] : null }))}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
            </div>
        ),
        onFilter: (value, record) => record.no_of_days && record.no_of_days.toString().includes(value),
        filteredValue: filteredInfo.no_of_days || null,
    },
    {
        title: <span style={titleStyle}>Prefix Date</span>,
        dataIndex: 'prefix_date',
        key: 'prefix_date',
        sorter: (a, b) => new Date(a.prefix_date) - new Date(b.prefix_date),
        sortDirections: ['ascend', 'descend'],
        render: (text) => text ? moment(text).format('YYYY-MM-DD') : '',
        filterDropdown: () => (
            <div style={{ padding: 8 }}>
                <DatePicker
                    onChange={(date) => setFilteredInfo(prev => ({ ...prev, prefix_date: date ? [date.format('YYYY-MM-DD')] : null }))}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
            </div>
        ),
        onFilter: (value, record) => record.prefix_date && record.prefix_date.includes(value),
        filteredValue: filteredInfo.prefix_date || null,
    },
    {
        title: <span style={titleStyle}>Suffix Date</span>,
        dataIndex: 'suffix_date',
        key: 'suffix_date',
        sorter: (a, b) => new Date(a.suffix_date) - new Date(b.suffix_date),
        sortDirections: ['ascend', 'descend'],
        render: (text) => text ? moment(text).format('YYYY-MM-DD') : '',
        filterDropdown: () => (
            <div style={{ padding: 8 }}>
                <DatePicker
                    onChange={(date) => setFilteredInfo(prev => ({ ...prev, suffix_date: date ? [date.format('YYYY-MM-DD')] : null }))}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
            </div>
        ),
        onFilter: (value, record) => record.suffix_date && record.suffix_date.includes(value),
        filteredValue: filteredInfo.suffix_date || null,
    },
    {
        title: <span style={titleStyle}>Reporting Date</span>,
        dataIndex: 'reporting_date',
        key: 'reporting_date',
        sorter: (a, b) => new Date(a.reporting_date) - new Date(b.reporting_date),
        sortDirections: ['ascend', 'descend'],
        render: (text) => text ? moment(text).format('YYYY-MM-DD') : '',
        filterDropdown: () => (
            <div style={{ padding: 8 }}>
                <DatePicker
                    onChange={(date) => setFilteredInfo(prev => ({ ...prev, reporting_date: date ? [date.format('YYYY-MM-DD')] : null }))}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
            </div>
        ),
        onFilter: (value, record) => record.reporting_date && record.reporting_date.includes(value),
        filteredValue: filteredInfo.reporting_date || null,
    },
    {
        title: <span style={titleStyle}>Remarks</span>,
        dataIndex: 'remarks',
        key: 'remarks',
        sorter: (a, b) => a.remarks.localeCompare(b.remarks),
        sortDirections: ['ascend', 'descend'],
        onFilter: (value, record) => record.remarks && record.remarks.includes(value),
        filteredValue: filteredInfo.remarks || null,
    },
    {
        title: <span style={titleStyle}>Actions</span>,
        key: 'actions',
        render: (_, record) => (
            <Space>
                <Button
                    onClick={() => handleShow(record)}
                    icon={<EditOutlined />}
                    style={{ backgroundColor: colors.edit, color: colors.surface }} // Set background color for the edit button
                />
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.id, record.name, record.posted_to, record.start_date, record.end_date)}
                    style={{ backgroundColor: colors.delete, color: colors.surface }} // Set background color for the delete button
                />
            </Space>
        ),
    }
    
];

    useEffect(() => {
        setLoading(true);
        axios.get('/postings')
            .then(response => {
                setPostings(response.data.map(post => ({
                    ...post,
                    start_date: post.start_date ? moment(post.start_date).format('YYYY-MM-DD') : '',
                    end_date: post.end_date ? moment(post.end_date).format('YYYY-MM-DD') : '',
                    prefix_date: post.prefix_date ? moment(post.prefix_date).format('YYYY-MM-DD') : '',
                    suffix_date: post.suffix_date ? moment(post.suffix_date).format('YYYY-MM-DD') : '',
                    reporting_date: post.reporting_date ? moment(post.reporting_date).format('YYYY-MM-DD') : ''
                })));
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching postings:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: '20px', backgroundColor: colors.background, borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: colors.primary, textAlign: 'center', marginBottom: '20px',fontWeight: 'bold' }}>Posting Details</h1>
        <Table
          columns={columns}
          dataSource={postings}
          rowKey="id"
          style={{ backgroundColor: colors.surface, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        />

            <Modal show={show} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton style={{ backgroundColor: colors.primary, color: colors.surface }}>
  <Modal.Title>Update Posting</Modal.Title>
</Modal.Header>
                <Modal.Body>
    {selectedPosting && (
        <Form>
            {/* Name */}
            <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={selectedPosting.name}
                    onChange={handleChange}
                    disabled
                />
            </Form.Group>

            {/* Posted To */}
            <Form.Group controlId="formPostedTo">
                <Form.Label>Posted To</Form.Label>
                <Form.Control
                    type="text"
                    name="posted_to"
                    value={selectedPosting.posted_to}
                    onChange={handleChange}
                />
            </Form.Group>

            {/* Start Date */}
            <Form.Group controlId="formStartDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                    type="date"
                    name="start_date"
                    value={selectedPosting.start_date}
                    onChange={handleChange}
                />
            </Form.Group>

            {/* End Date */}
            <Form.Group controlId="formEndDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                    type="date"
                    name="end_date"
                    value={selectedPosting.end_date}
                    onChange={handleChange}
                />
            </Form.Group>

            {/* Prefix Date */}
            <Form.Group controlId="formPrefixDate">
                <Form.Label>Prefix Date</Form.Label>
                <Form.Control
                    type="date"
                    name="prefix_date"
                    value={selectedPosting.prefix_date}
                    onChange={handleChange}
                />
            </Form.Group>

            {/* Suffix Date */}
            <Form.Group controlId="formSuffixDate">
                <Form.Label>Suffix Date</Form.Label>
                <Form.Control
                    type="date"
                    name="suffix_date"
                    value={selectedPosting.suffix_date}
                    onChange={handleChange}
                />
            </Form.Group>

            {/* Reporting Date */}
            <Form.Group controlId="formReportingDate">
                <Form.Label>Reporting Date</Form.Label>
                <Form.Control
                    type="date"
                    name="reporting_date"
                    value={selectedPosting.reporting_date}
                    onChange={handleChange}
                />
            </Form.Group>

            {/* Remarks */}
            <Form.Group controlId="formRemarks">
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                    as="textarea"
                    name="remarks"
                    value={selectedPosting.remarks}
                    onChange={handleChange}
                />
            </Form.Group>
        </Form>
    )}
</Modal.Body>

<Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>
        Cancel
    </Button>
    <Button
  variant="primary"
  onClick={handleUpdate}
  style={{ backgroundColor: colors.edit, borderColor: colors.edit, color: colors.surface, marginTop: '10px' }}
>
  Save Changes
</Button>

</Modal.Footer>

            </Modal>
        </div>
    );
};

export default PostingTable;