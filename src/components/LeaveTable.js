import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Typography, Modal} from 'antd';
import { SearchOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import '../css/UserTable.css';
import axios from 'axios';
import LeaveUpdateModal from './LeaveUpdateModal';

const { Title } = Typography;

const LeaveTable = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('All Leave');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteLeaveId, setDeleteLeaveId] = useState(null);
  


  const pageSize = 15;

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

  useEffect(() => {
    fetchLeaveData();
  }, []);

  useEffect(() => {
    filterData();
  }, [leaveData, activeTab, searchTerm, dateRange]);

  const titleStyle = {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: '16px', // Adjust the font size as needed
    letterSpacing: '0.5px', // Adds space between letters for better readability
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
    textTransform: 'uppercase', // Makes the text uppercase for a strong effect
};

const showDeleteConfirm = (id) => {
  setDeleteLeaveId(id);
  setIsDeleteModalVisible(true);
};
const handleDeleteConfirm = async () => {
  try {
      await axios.delete(`/api/leave/${deleteLeaveId}`);
      fetchLeaveData(); // Refresh data after delete
      setIsDeleteModalVisible(false); // Close modal
  } catch (error) {
      console.error('Error deleting leave data:', error);
  }
};

const handleDeleteCancel = () => {
  setIsDeleteModalVisible(false);
};

const columns = [
    {
        title: <span style={titleStyle}>Name</span>,
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        render: (text) => (
            <Space>
                <img src={`https://ui-avatars.com/api/?name=${text}&background=random`} alt={text} className="avatar" />
                {text || 'Unknown'}
            </Space>
        ),
    },
    {
        title: <span style={titleStyle}>Service Number</span>,
        dataIndex: 'service_number',
        key: 'service_number',
        sorter: (a, b) => (a.service_number || '').localeCompare(b.service_number || ''),
    },
    {
        title: <span style={titleStyle}>Start Date</span>,
        dataIndex: 'start_date',
        key: 'start_date',
        sorter: (a, b) => moment(a.start_date || '').diff(moment(b.start_date || '')),
        render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'N/A',
    },
    {
        title: <span style={titleStyle}>End Date</span>,
        dataIndex: 'end_date',
        key: 'end_date',
        sorter: (a, b) => moment(a.end_date || '').diff(moment(b.end_date || '')),
        render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'N/A',
    },
    {
        title: <span style={titleStyle}>Prefix On</span>,
        dataIndex: 'prefix_on',
        key: 'prefix_on',
        sorter: (a, b) => moment(a.prefix_on || '').diff(moment(b.prefix_on || '')),
        render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'N/A',
    },
    {
        title: <span style={titleStyle}>Suffix On</span>,
        dataIndex: 'suffix_on',
        key: 'suffix_on',
        sorter: (a, b) => moment(a.suffix_on || '').diff(moment(b.suffix_on || '')),
        render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'N/A',
    },
    {
        title: <span style={titleStyle}>No of Days</span>,
        dataIndex: 'no_of_days',
        key: 'no_of_days',
        sorter: (a, b) => (a.no_of_days || 0) - (b.no_of_days || 0),
    },
    {
        title: <span style={titleStyle}>Remarks</span>,
        dataIndex: 'remarks',
        key: 'remarks',
        render: (text) => text || 'N/A',
    },
    {
        title: <span style={titleStyle}>Leave Type</span>,
        dataIndex: 'leave_type',
        key: 'leave_type',
        sorter: (a, b) => (a.leave_type || '').localeCompare(b.leave_type || ''),
    },
    {
        title: <span style={titleStyle}>Status</span>,
        dataIndex: 'status',
        key: 'status',
        sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
    },
    {
        title: <span style={titleStyle}>Reporting Date</span>,
        dataIndex: 'reporting_date',
        key: 'reporting_date',
        sorter: (a, b) => moment(a.reporting_date || '').diff(moment(b.reporting_date || '')),
        render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'N/A',
    },
    {
        title: <span style={titleStyle}>Actions</span>,
        key: 'actions',
        render: (_, record) => (
            <Space size="middle">
                <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                    style={{ backgroundColor: colors.edit, color: colors.surface }} // Set background color for the edit button
                />
                <Button
    icon={<DeleteOutlined />}
    onClick={() => showDeleteConfirm(record.leave_id)} // Show confirmation modal
    style={{ backgroundColor: colors.delete, color: colors.surface }}
/>

            </Space>
        ),
    },
];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);

const handleStartDateChange = (date) => {
  setStartDate(date);
};

const handleEndDateChange = (date) => {
  setEndDate(date);
};


  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/leave');
      const data = response.data;
  
      const promises = data.map(async (item) => {
        const nameResponse = await axios.get(`/api/getname/${item.service_number}`);
        const nameData = nameResponse.data;
        return {
          ...item,
          name: nameData.length > 0 ? `${nameData[0].first_name} ${nameData[0].last_name}` : 'Unknown',
          start_date: item.start_date ? moment(item.start_date) : null,
          end_date: item.end_date ? moment(item.end_date) : null,
          prefix_on: item.prefix_on ? moment(item.prefix_on) : null,
          suffix_on: item.suffix_on ? moment(item.suffix_on) : null,
          reporting_date: item.reporting_date ? moment(item.reporting_date) : null,
        };
      });
  
      const mergedData = await Promise.all(promises);
      setLeaveData(mergedData);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = leaveData;
  
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        (entry.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.service_number || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    if (startDate && endDate) {
      const start = moment(startDate);
      const end = moment(endDate).endOf('day');
      
      filtered = filtered.filter(entry => {
        const entryStartDate = entry.start_date ? moment(entry.start_date) : null;
        const entryEndDate = entry.end_date ? moment(entry.end_date) : null;
  
        return (entryStartDate && entryStartDate.isBetween(start, end, null, '[]')) ||
               (entryEndDate && entryEndDate.isBetween(start, end, null, '[]'));
      });
    }
  
    // Apply tab-based filtering
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(entry => entry.status === 'pending');
        break;
      case 'approved':
        filtered = filtered.filter(entry => entry.status === 'approved');
        break;
      case 'absent': // AWL: Absent Without Leave
        filtered = filtered.filter(entry => entry.status === 'absent');
        break;
      case 'arriving today':
        filtered = filtered.filter(entry =>
          moment().isSame(moment(entry.end_date) || moment(entry.suffix_on) || moment(entry.reporting_date), 'day')
        );
        break;
      case 'Missed reporting': // OSL: Missed Reporting
        filtered = filtered.filter(entry =>
          moment().isAfter(moment(entry.end_date) || moment(entry.suffix_on) || moment(entry.reporting_date)) &&
          entry.reported_back === 'no'
        );
        break;
      default:
        break;
    }
  
    setFilteredData(filtered);
  };
  

  const handleEdit = (record) => {
    setSelectedLeave(record);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const response = await axios.put(`/api/leave/${selectedLeave.leave_id}`, selectedLeave);
      console.log(response.data);
      setIsModalVisible(false);
      fetchLeaveData(); // Refresh data after update
    } catch (error) {
      console.error('Error updating leave data:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const onFormFieldChange = (changedValues) => {
    setSelectedLeave(prev => ({
      ...prev,
      ...changedValues
    }));
  };
  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/leave/${id}`);
      fetchLeaveData(); // Refresh data after delete
    } catch (error) {
      console.error('Error deleting leave data:', error);
    }
  };
  

  return (
    <div style={{ padding: '20px', backgroundColor: colors.background, borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <h1 style={{ color: colors.primary, textAlign: 'center', marginBottom: '20px',fontWeight: 'bold' }}>Leave Records</h1>
   
      <Space style={{ marginBottom: 16 }}>
  <Button onClick={() => handleTabChange('All Leave')}>All Leave</Button>
  <Button onClick={() => handleTabChange('pending')}>Pending</Button>
  <Button onClick={() => handleTabChange('approved')}>Approved</Button>
  <Button onClick={() => handleTabChange('absent')}>AWL</Button>
  <Button onClick={() => handleTabChange('arriving today')}>Arriving Today</Button>
  <Button onClick={() => handleTabChange('Missed reporting')}>OSL</Button>
</Space>
<Space style={{ marginBottom: 16 }}>
  <Input
    placeholder="Search..."
    value={searchTerm}
    onChange={handleSearchChange}
    prefix={<SearchOutlined />}
  />
  <input
    type="date"
    onChange={(e) => handleStartDateChange(e.target.value)}
    style={{ marginRight: 8 }}
  />
  <input
    type="date"
    onChange={(e) => handleEndDateChange(e.target.value)}
  />
  <Button
    type="primary"
    icon={<FilterOutlined />}
    onClick={filterData} // Apply filter when dates are set
  >
  </Button>
</Space>

<Table
  columns={columns}
  dataSource={filteredData}
  pagination={{
    current: currentPage,
    pageSize,
    total: filteredData.length,
    onChange: handlePageChange
  }}
  loading={loading} // This indicates the loading state
/>
<Modal
    title="Confirm Deletion"
    visible={isDeleteModalVisible}
    onOk={handleDeleteConfirm}
    onCancel={handleDeleteCancel}
    okText="Delete"
    cancelText="Cancel"
>
    <p>Are you sure you want to delete this leave record?</p>
</Modal>

      <LeaveUpdateModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        selectedLeave={selectedLeave}
        onFormFieldChange={onFormFieldChange}
      />
    </div>
  );
};

export default LeaveTable;