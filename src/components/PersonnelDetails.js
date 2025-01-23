import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Layout, Tabs, Button, Table, Avatar, Modal, Upload, message } from 'antd';
import { ExclamationCircleOutlined, UserOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import '../css/PersonnelDetails.css';
import moment from 'moment';


const { Content } = Layout;
const { TabPane } = Tabs;
const { confirm } = Modal;


const PersonnelDetails = () => {
  const { service_number } = useParams();
  const [personnel, setPersonnel] = useState({});
  const [courses, setCourses] = useState([]);
  const [wifeData, setWifeData] = useState([]);
  const [childData, setChildData] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [disciplinaryActions, setDisciplinaryActions] = useState([]);
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [posting, setPosting] = useState([]);
  const [activeTab, setActiveTab] = useState('personnel');
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [isJointPhotoModalVisible, setIsJointPhotoModalVisible] = useState(false);
  const [uploadingPersonalPhoto, setUploadingPersonalPhoto] = useState(false);
  const [uploadingJointPhoto, setUploadingJointPhoto] = useState(false);


  useEffect(() => {
    fetchPersonnelDetails();
    fetchCourses();
    fetchWifeData();
    fetchChildData();
    fetchBankDetails();
    fetchDisciplinaryActions();
    fetchLeaveDetails();
    fetchQualifications();
    fetchPosting();
  }, [service_number]);

  const fetchPersonnelDetails = async () => {
    try {
      const response = await axios.get(`/personnel/Details/${service_number}`);
      setPersonnel(response.data[0] || {});
    } catch (error) {
      console.error('Error fetching personnel details:', error);
    }
  };
  const showJointPhotoModal = () => {
    setIsJointPhotoModalVisible(true);
};

const handleJointPhotoModalCancel = () => {
    setIsJointPhotoModalVisible(false);
};

  
  // Utility function to parse and format dates
  const formatDate = (value) => {
    return moment(value, moment.ISO_8601, true).isValid()
      ? moment(value).format('DD-MM-YYYY')
      : value;
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return ''; // Handle empty strings
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/getpersonnelcourses/${service_number}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  

  const fetchWifeData = async () => {
    try {
      const response = await axios.get(`/personnel/getwife/${service_number}`);
      setWifeData(response.data);
    } catch (error) {
      console.error('Error fetching wife data:', error);
    }
  };

  const fetchChildData = async () => {
    try {
      const response = await axios.get(`/personnel/getchild/${service_number}`);
      setChildData(response.data);
    } catch (error) {
      console.error('Error fetching child data:', error);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(`/leavemanagement/bankdetails/${service_number}`);
      setBankDetails(response.data);
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const fetchDisciplinaryActions = async () => {
    try {
      const response = await axios.get(`/api/disciplinary_action/${service_number}`);
      setDisciplinaryActions(response.data);
    } catch (error) {
      console.error('Error fetching disciplinary actions:', error);
    }
  };

  const fetchLeaveDetails = async () => {
    try {
      const response = await axios.get(`/leavemanagement/leave/${service_number}`);
      setLeaveDetails(response.data);
    } catch (error) {
      console.error('Error fetching leave details:', error);
    }
  };

  const fetchQualifications = async () => {
    try {
      const response = await axios.get(`/leavemanagement/qualifications/${service_number}`);
      setQualifications(response.data);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
    }
  };

  const fetchPosting = async () => {
    try {
      const response = await axios.get(`/postings/${service_number}`);
      setPosting(response.data);
    } catch (error) {
      console.error('Error fetching posting data:', error);
    }
  };
  const uploadPhoto = async (file, type) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('service_number', service_number);
    formData.append('type', type);

    try {
      const response = await axios.post('/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        message.success('Photo uploaded successfully');
        if (type === 'personal') {
          setPersonnel({ ...personnel, photo: response.data.filename });
        } else if (type === 'joint') {
          setWifeData([{ ...wifeData[0], jointphoto: response.data.filename }]);
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      message.error('Failed to upload photo');
    } finally {
      setUploadingPersonalPhoto(false);
      setUploadingJointPhoto(false);
    }
  };

  const handlePersonalPhotoUpload = info => {
    if (info.file.status === 'uploading') {
      setUploadingPersonalPhoto(true);
      return;
    }
    if (info.file.status === 'done') {
      uploadPhoto(info.file.originFileObj, 'personal');
    }
  };

  const handleJointPhotoUpload = info => {
    if (info.file.status === 'uploading') {
      setUploadingJointPhoto(true);
      return;
    }
    if (info.file.status === 'done') {
      uploadPhoto(info.file.originFileObj, 'joint');
    }
  };
  const showPhotoModal = () => {
    setIsPhotoModalVisible(true);
  };

  const handlePhotoModalCancel = () => {
    setIsPhotoModalVisible(false);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Are you sure you want to delete this personnel?',
      icon: <ExclamationCircleOutlined />,
      content: 'Deleting this personnel will remove all related records (courses, leave details, bank details, etc.).',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        checkIfAdminBeforeDelete(); // Check if personnel is an admin before showing the second warning
      },
    });
  };

  // Check if the personnel is an admin before proceeding with the second warning
  const checkIfAdminBeforeDelete = async () => {
    try {
      const response = await axios.get(`/alldelete/checkAdmin?service_number=${service_number}`);
      
      if (response.data.isAdmin) {
        // If personnel is an admin, show warning and do not proceed with delete
        message.warning('Personnel is an admin. Please ask the super admin to first remove the admin role.');
      } else {
        // If personnel is not an admin, show the second confirmation warning
        confirmSecondWarning();
      }
    } catch (error) {
      message.error('Error checking admin status');
      console.error('Error checking admin status:', error);
    }
  };

  // Show second confirmation warning before final deletion
  const confirmSecondWarning = () => {
    confirm({
      title: 'This action cannot be undone. Are you absolutely sure?',
      icon: <ExclamationCircleOutlined />,
      content: 'Once deleted, all entries related to this personnel will be permanently removed.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        deletePersonnel(); // Proceed with the deletion
      },
    });
  };

  // Delete the personnel and all related data
  const deletePersonnel = async () => {
    try {
      const response = await axios.delete(`/alldelete/${service_number}`);
      if (response.data.message) {
        message.success('Personnel and all related data deleted successfully.');
      } else {
        message.error('Failed to delete personnel.');
      }
    } catch (error) {
      console.error('Error deleting personnel:', error);
      message.error('An error occurred during deletion.');
    } finally {
      // Reload the page after the deletion process
      window.location.reload();
    }
  };

  const capitalizeAndFormat = (string) => {
    if (!string) return ''; // Handle empty strings
    return string
      .split('_') // Split by underscore
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
      .join(' '); // Join back with spaces
  };
  

  const personnelColumns = [
    { title: 'Field', dataIndex: 'field', key: 'field' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
  ];
  
  
  
  
  const personnelData = Object.entries(personnel).map(([key, value]) => ({
    key,
    field: capitalizeAndFormat(key), // Use the new formatting function for field names
    value: formatDate(value), // Use the formatDate function for date formatting
  }));

  
  const coursesColumns = [
    { title: 'Course Name', dataIndex: 'course_name', key: 'course_name' },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date' ,
      render: (text) => moment(text).format('YYYY/MM/DD'),},
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date',
      render: (text) => moment(text).format('YYYY/MM/DD'), },
    { title: 'Grade', dataIndex: 'grade', key: 'grade' },
  ];

  const wifeColumns = [
    { title: 'Field', dataIndex: 'field', key: 'field' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
  ];

  const wifeTableData = wifeData.length > 0
    ? Object.entries(wifeData[0])
        .filter(([key]) => !['wife_id', 'personnel_id', 'service_number'].includes(key))
        .map(([key, value]) => ({ key, field: capitalizeAndFormat(key), value: formatDate(value), })) // Format fields
    : [];

    const childColumns = [
      { title: 'Field', dataIndex: 'field', key: 'field' },
      { title: 'Value', dataIndex: 'value', key: 'value' },
    ];
    
    // Assuming childData is an array of objects, where each object represents a child
    const ChildTableData = childData.reduce((acc, child, index) => {
      // Create a header for each child's details
      acc.push({
        key: `header-${index}`, // Unique key for the header
        field: `Child Details ${index + 1}`, // Change here for dynamic header
        value: '', // Empty value for the header
      });
    
      // Exclude specified keys and format remaining fields
      const filteredEntries = Object.entries(child)
        .filter(([key]) => !['child_id', 'personnel_id', 'service_number'].includes(key))
        .map(([key, value]) => ({
          key: `${child.child_id}-${key}`, // Ensure a unique key for each row
          field: capitalizeAndFormat(key),
          value: formatDate(value),
        }));
    
      return acc.concat(filteredEntries); // Combine header and entries
    }, []);
    
    // Now ChildTableData includes headers followed by child details
    
    

  const bankDetailsColumns = [
    { title: 'Bank ID', dataIndex: 'bank_id', key: 'bank_id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Single Account Number', dataIndex: 'single_ac_no', key: 'single_ac_no' },
    { title: 'Single Account Bank Name', dataIndex: 'single_ac_bank_name', key: 'single_ac_bank_name' },
    { title: 'Joint Account Number', dataIndex: 'joint_ac_no', key: 'joint_ac_no' },
    { title: 'Joint Account Bank Name', dataIndex: 'joint_ac_bank_name', key: 'joint_ac_bank_name' },
  ];

  const disciplinaryActionsColumns = [
    { title: 'Action ID', dataIndex: 'action_id', key: 'action_id' },
    { title: 'Action Date', dataIndex: 'action_date', key: 'action_date',
      render: (text) => moment(text).format('YYYY/MM/DD'), },
    { title: 'Action Type', dataIndex: 'action_type', key: 'action_type' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Resolved Date', dataIndex: 'resolved_date', key: 'resolved_date',
      render: (text) => moment(text).format('YYYY/MM/DD'), },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
  ];

 
const leaveColumns = [
  { title: 'Leave ID', dataIndex: 'leave_id', key: 'leave_id' },
  {
    title: 'Start Date',
    dataIndex: 'start_date',
    key: 'start_date',
    render: (text) => moment(text).format('YYYY/MM/DD'), // Format the date correctly
  },
  {
    title: 'End Date',
    dataIndex: 'end_date',
    key: 'end_date',
    render: (text) => moment(text).format('YYYY/MM/DD'),
  },
  { title: 'Prefix On', dataIndex: 'prefix_on', key: 'prefix_on',render: (text) => moment(text).format('YYYY/MM/DD'), },
  { title: 'Suffix On', dataIndex: 'suffix_on', key: 'suffix_on',render: (text) => moment(text).format('YYYY/MM/DD'), },
  { title: 'Number of Days', dataIndex: 'no_of_days', key: 'no_of_days' },
  { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
  { title: 'Leave Type', dataIndex: 'leave_type', key: 'leave_type' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Reported Back', dataIndex: 'reported_back', key: 'reported_back' },
  {
    title: 'Reporting Date',
    dataIndex: 'reporting_date',
    key: 'reporting_date',
    render: (text) => moment(text).format('YYYY/MM/DD'),
  },
];


  const qualificationsColumns = [
    { title: 'Qualification ID', dataIndex: 'qualification_id', key: 'qualification_id' },
    { title: 'Qualification Name', dataIndex: 'qualification_name', key: 'qualification_name' },
  ];

  const postingColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Posted To', dataIndex: 'posted_to', key: 'posted_to' },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date',
      render: (text) => moment(text).format('YYYY/MM/DD'), },
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date',
      render: (text) => moment(text).format('YYYY/MM/DD'), },
    { title: 'No. of Days', dataIndex: 'no_of_days', key: 'no_of_days' },
    { title: 'Prefix Date', dataIndex: 'prefix_date', key: 'prefix_date',
      render: (text) => moment(text).format('YYYY/MM/DD'), },
    { title: 'Suffix Date', dataIndex: 'suffix_date', key: 'suffix_date',
      render: (text) => moment(text).format('YYYY/MM/DD'), },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
    { title: 'Reported Back', dataIndex: 'reported_back', key: 'reported_back' },
    { title: 'Reporting Date', dataIndex: 'reporting_date', key: 'reporting_date',
      render: (text) => moment(text).format('YYYY/MM/DD'), },
    { title: 'Type of WT', dataIndex: 'type_of_wt', key: 'type_of_wt' },
    { title: 'Report To', dataIndex: 'report_to', key: 'report_to' },
    { title: 'Rum and Cig Allowance Paid Upto', dataIndex: 'rum_and_cig_allowance_paid_upto', key: 'rum_and_cig_allowance_paid_upto' },
    { title: 'Type of Arms', dataIndex: 'type_of_arms', key: 'type_of_arms' },
    { title: 'Arms Regd No', dataIndex: 'arms_regd_no', key: 'arms_regd_no' },
    { title: 'Party Of', dataIndex: 'party_of', key: 'party_of' },
    { title: 'CEA and CILQ Pub Upto', dataIndex: 'cea_and_cilq_pub_upto', key: 'cea_and_cilq_pub_upto' },
    { title: 'Auth', dataIndex: 'auth', key: 'auth' },
    { title: 'Extra Copy To', dataIndex: 'extra_copy_to', key: 'extra_copy_to' },
  ];
  

  return (

    <Layout style={{ minHeight: '100vh' }}>
    <Content style={{ padding: '0 24px', minHeight: 280 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>
          <Avatar
            size={100}
            src={`/uploads/${personnel.photo}`}
            icon={<UserOutlined />}
            onClick={showPhotoModal}
            style={{ cursor: 'pointer' }}
          />
          <Upload
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess("ok");
              }, 0);
            }}
            onChange={handlePersonalPhotoUpload}
          >
            <Button icon={<UploadOutlined />} loading={uploadingPersonalPhoto}>
              Update Personal Photo
            </Button>
          </Upload>
        </div>
        <div style={{ marginLeft: 20 }}>
          <Avatar
            size={100}
            src={`/uploads/${wifeData.length > 0 ? wifeData[0].jointphoto : ''}`}
            icon={<UserOutlined />}
            onClick={showJointPhotoModal}
            style={{ cursor: 'pointer' }}
          />
          <Upload
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess("ok");
              }, 0);
            }}
            onChange={handleJointPhotoUpload}
          >
            <Button icon={<UploadOutlined />} loading={uploadingJointPhoto}>
              Update Joint Photo
            </Button>
          </Upload>
        </div>
        <div style={{ marginLeft: 20 }}>
          <h2>{`${capitalizeFirstLetter(personnel.first_name)} ${capitalizeFirstLetter(personnel.last_name)}`}</h2>
          <p>Service Number: {personnel.service_number}</p>
          <p>Rank: {personnel.rank}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
      <Button
        type="primary"
        danger
        icon={<DeleteOutlined />}
        onClick={showDeleteConfirm}
        style={{ fontWeight: 'bold' }}
      >
        Delete Personnel
      </Button>
    </div>
      </div>
     


  

        {/* Modal to show enlarged photo */}
        <Modal
          title="Personnel Photo"
          visible={isPhotoModalVisible}
          onCancel={handlePhotoModalCancel}
          footer={null}
        >
          <img
            alt="Personnel"
            src={`/uploads/${personnel.photo}`} // Full-size photo
            style={{ width: '100%' }}
          />
        </Modal>
        <Modal
    title="Joint Photo"
    visible={isJointPhotoModalVisible}
    onCancel={handleJointPhotoModalCancel}
    footer={null}
>
    <img 
        src={`/uploads/${wifeData.length > 0 ? wifeData[0].jointphoto : ''}`} // replace with the actual joint photo URL
        alt="Joint"
        style={{ width: '100%', height: 'auto' }} // Adjust styles as needed
    />
</Modal>

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Personnel Details" key="personnel">
            <Table
              columns={personnelColumns}
              dataSource={personnelData}
              pagination={false}
              bordered
              size="middle"
            />
          </TabPane>
          <TabPane tab="Courses" key="courses">
            <Table
              columns={coursesColumns}
              dataSource={courses}
              pagination={false}
              bordered
              size="middle"
            />
          </TabPane>
          <TabPane tab="Wife Details" key="wife">
            <Table
              columns={wifeColumns}
              dataSource={wifeTableData}
              pagination={false}
              bordered
              size="middle"
            />
          </TabPane>
          <TabPane tab="Children Details" key="children">
            <Table
              columns={childColumns}
              dataSource={ChildTableData}
              pagination={false}
              bordered
              size="middle"
              rowKey="key"
            />
          </TabPane>
          <TabPane tab="Bank Details" key="bank">
            <Table
              columns={bankDetailsColumns}
              dataSource={bankDetails}
              pagination={false}
              bordered
              size="middle"
            />
          </TabPane>
          <TabPane tab="Disciplinary Actions" key="disciplinary">
            <Table
              columns={disciplinaryActionsColumns}
              dataSource={disciplinaryActions}
              pagination={false}
              bordered
              size="middle"
            />
          </TabPane>
          <TabPane tab="Leave Details" key="leave">
            <Table
              columns={leaveColumns}
              dataSource={leaveDetails}
              pagination={false}
              bordered
              size="middle"
            />
          </TabPane>
          <TabPane tab="Qualifications" key="qualifications">
            <Table
              columns={qualificationsColumns}
              dataSource={qualifications}
              pagination={false}
              bordered
              size="middle"
            />
          </TabPane>
          <TabPane tab="Posting History" key="posting">
            <Table
              columns={postingColumns}
              dataSource={posting}
              pagination={false}
              bordered
              size="middle"
            />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default PersonnelDetails;
