import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers, FaEllipsisH, FaCalendarAlt, FaPlus, FaEye, FaEllipsisV } from 'react-icons/fa';
import { MdCoPresent, MdDeleteOutline } from 'react-icons/md';
import { FcLeave } from 'react-icons/fc';
import { Modal, Form, Input, Button, DatePicker, Select, List, Menu, Dropdown } from 'antd';
import './Dashboard.css';
import RankDiversityGraph from '../components/RankDiversityGraph';

const Card = ({ icon: Icon, title, count, change, lastMonth }) => (
  <div className="dashboard-card">
    <div className="card-header">
      <div className="icon-container">
        <Icon />
      </div>
      <span className="card-title">{title}</span>
      <button className="more-options">
        <FaEllipsisH />
      </button>
    </div>
    <div className="card-content">
      <div className="property-count">{count}</div>
      <div className="property-info">
        <span className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
        </span>
        <span className="last-month">Last month total {lastMonth}</span>
      </div>
    </div>
  </div>
);

const TodoItem = ({ item, onDelete }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'overdue': return 'overdue';
      case 'in progress': return 'in-progress';
      case 'completed': return 'completed';
      default: return 'pending';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getTimeLeftText = (dateString) => {
    const taskDate = new Date(dateString);
    const today = new Date();
    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 Day Left';
    return `${diffDays} Days Left`;
  };

  return (
    <div className="todo-item shadow-container">
      <div className="todo-icon">
        <FaCalendarAlt />
      </div>
      <div className="todo-content">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <div className="todo-meta">
        <span className="todo-date">{formatDate(item.date)}</span>
        <span className={`todo-status ${getStatusClass(item.status)}`}>
          {getTimeLeftText(item.date)}
        </span>
      </div>
      <button className="more-options" onClick={() => onDelete(item.task_id)}>
        <MdDeleteOutline />
      </button>
    </div>
  );
};

const Dashboard = () => {
  const [totalPersonnel, setTotalPersonnel] = useState(0);
  const [present, setPresent] = useState(0);
  const [absent, setAbsent] = useState(0);
  const [presentChange, setPresentChange] = useState(0);
  const [absentChange, setAbsentChange] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isAllTasksModalVisible, setIsAllTasksModalVisible] = useState(false);

  useEffect(() => {
    fetchAttendanceSummary();
    fetchTasks();
  }, []);

  const fetchAttendanceSummary = async () => {
    try {
      const response = await axios.get('/attend/summary');
      const { totalPersonnel, presentCount, absentCount } = response.data;

      setTotalPersonnel(totalPersonnel);
      setPresent(presentCount);
      setAbsent(absentCount);

      const presentPercentage = (presentCount / totalPersonnel) * 100;
      const absentPercentage = (absentCount / totalPersonnel) * 100;

      setPresentChange(presentCount === totalPersonnel ? 100 : presentPercentage);
      setAbsentChange(absentCount === 0 ? -100 : -absentPercentage);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.task_id}`, values);
      } else {
        await axios.post('/api/tasks', values);
      }
      setIsModalVisible(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const showModal = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTask(null);
  };

  const showAllTasksModal = () => {
    setIsAllTasksModalVisible(true);
  };

  const handleAllTasksModalCancel = () => {
    setIsAllTasksModalVisible(false);
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={showAllTasksModal} icon={<FaEye />}>
        View All
      </Menu.Item>
      <Menu.Item key="2" onClick={() => showModal(null)} icon={<FaPlus />}>
        Create New
      </Menu.Item>
    </Menu>
  );


  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
      </header>
      <div className="dashboard-divider"></div>
      <div className="card-container">
        <Card
          icon={FaUsers}
          title="Total Personnel"
          count={totalPersonnel}
          change={20}
          lastMonth="5"
        />
        <Card
          icon={MdCoPresent}
          title="Present Personnel"
          count={present}
          change={presentChange}
          lastMonth="525"
        />
        <Card
          icon={FcLeave}
          title="Total Absent"
          count={absent}
          change={absentChange}
          lastMonth="1,045"
        />
      </div>
      <div className="dashboard-grid">
        <div className="todo-section">
          <div className="todo-header">
            <h2>Things to do <span>({tasks.length})</span></h2>
            <div className='todo-menubtn'>
              <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                <button className="more-options">
                  <FaEllipsisV />
                </button>
              </Dropdown>
            </div>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={tasks.slice(0, 3)}
            renderItem={item => (
              <TodoItem item={item} onDelete={handleDelete} />
            )}
          />
        </div>
        <RankDiversityGraph />
      </div>

      <Modal
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          initialValues={editingTask}
          onFinish={handleCreateOrUpdate}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the task title!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select the date!' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="In Progress">In Progress</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
              <Select.Option value="Overdue">Overdue</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="All Tasks"
        visible={isAllTasksModalVisible}
        onCancel={handleAllTasksModalCancel}
        footer={null}
        width={800}
      >
        <div className="all-tasks-container">
          <List
            itemLayout="horizontal"
            dataSource={tasks}
            renderItem={item => (
              <TodoItem item={item} onDelete={handleDelete} />
            )}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;