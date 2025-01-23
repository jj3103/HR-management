import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PersonnelForm from './components/PersonnelForm';
import PersonnelList from './components/PersonnelList';
import CourseList from './components/CourseList';
import CourseForm from './components/AddCourseForm.js';
import PersonnelDetails from './components/PersonnelDetails';
import Notifications from './pages/notification';
import PostingForm from './components/PostingFrom';
import PostingTable from './components/postingtable';
import LeaveForm from './components/LeaveForm';
import LeaveTable from './components/LeaveTable';
import DisciplinaryActionForm from './components/DisciplinaryActionForm';
import DisciplinaryTable from './components/DisciplinaryTable';
import QualificationForm from './components/QualificationForm';
import PersonnelQualificationTable from './components/PersonnelQualificationTable';
import PromotionRequirementsTable from './components/PromotionRequirmentTable';
import AdditionalColumns from './components/AdditionalColumns';
import ManageAdmin from './pages/ManageAdmin';
import Layout from './components/Layout';
import PersonnelPromotionRequirementForm from './components/PersonnelPromotionRequirementForm';
import QualifiedPersonnelTable from './pages/QualifiedPersonnelTable.js';
import BankDetailsForm from './components/BankDetailsForm.js';
import PersonnelBankDetails from './components/PersonnelBankDetails.js';
import Graph from './components/Graph.js';
import LeaveManagement from './components/LeaveManagement.js';
import PrivateRoute from './components/PrivateRoute';  // Import PrivateRoute


const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<PrivateRoute element={Dashboard} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<PrivateRoute element={Dashboard} />} />
                    <Route path="/add-personnel" element={<PrivateRoute element={PersonnelForm} />} />
                    <Route path="/personnel-list" element={<PrivateRoute element={PersonnelList} />} />
                    <Route path="/course-list" element={<PrivateRoute element={CourseList} />} />
                    <Route path="/course-form" element={<PrivateRoute element={CourseForm} />} />
                    <Route path="/personnelDetails/:service_number" element={<PrivateRoute element={PersonnelDetails} />} />
                    <Route path="/notification" element={<PrivateRoute element={Notifications} />} />
                    <Route path="/postingform" element={<PrivateRoute element={PostingForm} />} />
                    <Route path="/postings" element={<PrivateRoute element={PostingTable} />} />
                    <Route path="/leaveform" element={<PrivateRoute element={LeaveForm} />} />
                    <Route path="/leavetable" element={<PrivateRoute element={LeaveTable} />} />
                    <Route path="/discplinaryactions" element={<PrivateRoute element={DisciplinaryActionForm} />} />
                    <Route path="/discplinarytable" element={<PrivateRoute element={DisciplinaryTable} />} />
                    <Route path="/qualificationform" element={<PrivateRoute element={QualificationForm} />} />
                    <Route path="/qualificationtable" element={<PrivateRoute element={PersonnelQualificationTable} />} />
                    <Route path="/promotionTable" element={<PrivateRoute element={PromotionRequirementsTable} />} />
                    <Route path="/additional-columns" element={<PrivateRoute element={AdditionalColumns} />} />
                    <Route path="/manageadmin" element={<PrivateRoute element={ManageAdmin} />} />
                    <Route path="/PersonnelPromotionRequirementForm" element={<PrivateRoute element={PersonnelPromotionRequirementForm} />} />
                    <Route path="/QualifiedPersonnelTable" element={<PrivateRoute element={QualifiedPersonnelTable} />} />
                    <Route path='/bankdetailsform' element={<PrivateRoute element={BankDetailsForm} />} />
                    <Route path='/bankdetails' element={<PrivateRoute element={PersonnelBankDetails} />} />
                    <Route path='/graph' element={<PrivateRoute element={Graph} />} />
                    <Route path='/leavemanagement' element={<PrivateRoute element={LeaveManagement} />} />
                    
                </Routes>
            </Layout>
            <ToastContainer />
        </Router>
    );
};

export default App;