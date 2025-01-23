import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, Button, Space, Modal, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TfiMoreAlt } from "react-icons/tfi";
import { SearchOutlined, SortAscendingOutlined, SortDescendingOutlined, FilterOutlined, EditOutlined,FullscreenOutlined } from '@ant-design/icons';
import moment from 'moment';
import '../css/UserTable.css';
import UpdatePersonnel from './UpdatePersonnel';
import UpdateWife from './UpdateWife';
import UpdateChild from './UpdateChild';


const { TabPane } = Tabs;

const PersonnelList = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('Personnel Details');
  const [searchFilters, setSearchFilters] = useState({});
  const [sortOrder, setSortOrder] = useState('ascend');
  const [sortField, setSortField] = useState(null);
  const [filterVisible, setFilterVisible] = useState({});
  const [globalSearch, setGlobalSearch] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const pageSize = 50;

  useEffect(() => {
    fetchData();
  }, [activeTab, searchFilters, sortOrder, sortField, globalSearch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dataResponse, columnsResponse] = await Promise.all([
        fetchDataByTab(activeTab),
        fetchColumns()
      ]);
      setData(dataResponse);
      setColumns(columnsResponse);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (value, type) => {
    if (!value) return null;
    if (moment(value, moment.ISO_8601, true).isValid()) {
      switch (type.toLowerCase()) {
        case 'date':
          return moment(value).format('YYYY-MM-DD');
        case 'datetime':
        case 'timestamp':
          return moment(value).format('YYYY-MM-DDTHH:mm');
        default:
          return value;
      }
    }
    return value;
  };


  const fetchDataByTab = async (tab) => {
    const endpoints = {
      'Personnel Details': '/dynamic/personnel/combined',
      'Wife Details': '/dynamic/wife/combined',
      'Child Details': '/dynamic/child/combined'
    };
    
    const response = await axios.get(endpoints[tab]);
    let formattedData = Array.isArray(response.data) ? response.data : [];

    // Format dates using the new formatDate function
    formattedData = formattedData.map(item => {
      const formattedItem = { ...item };
      Object.keys(formattedItem).forEach(key => {
        if (formattedItem[key] && typeof formattedItem[key] === 'string') {
          // Determine the date type based on the presence of time information
          const dateType = formattedItem[key].includes('T') ? 'datetime' : 'date';
          formattedItem[key] = formatDate(formattedItem[key], dateType);
        }
      });
      return formattedItem;
    });

    // Apply global search filter
    if (globalSearch) {
      formattedData = formattedData.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(globalSearch.toLowerCase())
        )
      );
    }

    // Apply individual column search filters
    if (Object.keys(searchFilters).length > 0) {
      formattedData = formattedData.filter(item => {
        return Object.entries(searchFilters).every(([column, value]) => {
          return String(item[column] || '').toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    // Apply sorting
    if (sortField) {
      formattedData = formattedData.sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'ascend' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'ascend' ? 1 : -1;
        return 0;
      });
    }

    return formattedData;
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

  const handleEdit = (id) => {
    setEditingId(id);
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setEditingId(null);
  };

  const titleStyle = {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: '14px',
    letterSpacing: '0.5px',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    textTransform: 'uppercase',
};


const fetchColumns = async () => {
    const endpoints = {
        'Personnel Details': '/dynamic/personnel/combined/columns',
        'Wife Details': '/dynamic/wife/combined/columns',
        'Child Details': '/dynamic/child/combined/columns'
    };
    
    const response = await axios.get(endpoints[activeTab]);
    let columnsData = Array.isArray(response.data) ? response.data : [];

    // Prepare the actions column
    const actionsColumn = {
      title: <span style={titleStyle}>Actions</span>,
        key: 'actions',
        render: (text, record) => (
            <Space>
                <Button
                    onClick={() => handleFullDetails(activeTab === 'Child Details' ? record.child_id : record.service_number)}
                    icon={<FullscreenOutlined />}
                >
                    Full Details
                </Button>
                <Button
                    onClick={() => handleEdit(activeTab === 'Child Details' ? record.child_id : record.service_number)}
                    icon={<EditOutlined />}
                >
                    Edit
                </Button>
            </Space>
        ),
    };
    // Prepare other columns
    columnsData = columnsData
        .filter(col => col.Field !== 'personnel_id')
        .map((col) => {
            const formattedTitle = col.Field.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            return {
                title: (
                    <div className="sortable-header" style={titleStyle}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div>{formattedTitle}</div>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => toggleFilterVisibility(col.Field)}
                                style={{ marginLeft: '8px' }}
                            />
                        </div>
                        {filterVisible[col.Field] && (
                            <Input
                                placeholder={`Search ${formattedTitle}`}
                                onChange={(e) => handleSearch(e.target.value, col.Field)}
                                style={{ width: 150, marginTop: 8 }}
                            />
                        )}
                        {sortField === col.Field ? (
                            sortOrder === 'ascend' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
                        ) : null}
                    </div>
                ),
                dataIndex: col.Field,
                key: col.Field,
                render: (text) => text || '-',
                sorter: true,
                onHeaderCell: column => ({
                    onClick: () => {
                        if (sortField === column.dataIndex) {
                            setSortOrder(prevOrder => (prevOrder === 'ascend' ? 'descend' : 'ascend'));
                        } else {
                            setSortField(column.dataIndex);
                            setSortOrder('ascend');
                        }
                    },
                    style: titleStyle, // Apply the title style here
                })
            };
        });

    // Add actions column at the beginning
    return [actionsColumn, ...columnsData];
};

  const toggleFilterVisibility = (columnKey) => {
    setFilterVisible((prevVisible) => ({
      ...prevVisible,
      [columnKey]: !prevVisible[columnKey], // Toggle visibility
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value, columnKey) => {
    setSearchFilters(prev => ({
      ...prev,
      [columnKey]: value,
    }));
  };

  const handleGlobalSearch = (value) => {
    setGlobalSearch(value);
  };

  const handleFullDetails = (id) => {
    if (activeTab === 'Child Details') {
      navigate(`/childDetails/${id}`);
    } else {
      navigate(`/personnelDetails/${id}`);
    }
  };
 
  return (
    <div className="user-table-container">
      <h1 style={{ color: colors.primary, marginBottom: '20px', fontWeight: 'bold' }}>Personnel List</h1>
      <div className="table-header">
        <Space style={{ marginBottom: '16px' }}>
          <Input
            placeholder="Global Search"
            value={globalSearch}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
        </Space>
      </div>
      <Tabs defaultActiveKey="Personnel Details" activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Personnel Details" key="Personnel Details" />
        <TabPane tab="Wife Details" key="Wife Details" />
        <TabPane tab="Child Details" key="Child Details" />
      </Tabs>
      <Table
        childrenColumnName="antdChildren"
        columns={columns}
        dataSource={data}
        rowKey={(record) => activeTab === 'Child Details' ? record.child_id : record.service_number}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data.length,
          onChange: handlePageChange,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} rows`,
        }}
        loading={loading}
      />
      <Modal
        title={`Edit ${activeTab === 'Wife Details' ? 'Wife' : activeTab === 'Child Details' ? 'Child' : 'Personnel'}`}
        visible={isEditModalVisible}
        onCancel={handleEditModalClose}
        footer={null}
        width={800}
      >
        {editingId && (
          activeTab === 'Wife Details' ? (
            <UpdateWife
              serviceNumber={editingId}
              onSuccess={() => {
                handleEditModalClose();
                fetchData(); // Refresh the data after successful update
              }}
            />
          ) : activeTab === 'Child Details' ? (
            <UpdateChild
              childId={editingId}
              onSuccess={() => {
                handleEditModalClose();
                fetchData(); // Refresh the data after successful update
              }}
            />
          ) : (
            <UpdatePersonnel
              serviceNumber={editingId}
              onSuccess={() => {
                handleEditModalClose();
                fetchData(); // Refresh the data after successful update
              }}
            />
          )
        )}
      </Modal>
    </div>
  );
};

export default PersonnelList;