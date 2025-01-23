// src/components/Register.js

import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/authContext';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [personnel, setPersonnel] = useState([]);
    const [serviceNumber, setServiceNumber] = useState('');
    const [superAdminExists, setSuperAdminExists] = useState(false);
    const [role, setRole] = useState('superadmin');

    const { setIsLoggedIn, setUserEmail, setUserRole } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/users/superadmin')
            .then(response => {
                setSuperAdminExists(response.data.exists);
            })
            .catch(error => {
                console.error('Error checking superadmin existence', error);
            });
    }, []);

    useEffect(() => {
        if (searchTerm) {
            axios.get(`/personnelsearch?searchTerm=${searchTerm}`)
                .then(response => {
                    setPersonnel(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the personnel data!', error);
                });
        } else {
            setPersonnel([]);
        }
    }, [searchTerm]);

    const handlePersonnelSelect = (selectedPersonnel) => {
        setServiceNumber(selectedPersonnel.service_number);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (superAdminExists) {
            toast.error('Super Admin Already Exists');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/users/register', { serviceNumber, email, password, role });
            if (response.data === true) {
                setSuperAdminExists(true);
            }
            else {
                // Store login status in localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('role', role);
                localStorage.setItem('service_number', serviceNumber);

                // Update context
                setIsLoggedIn(true);
                setUserEmail(email);
                setUserRole(role);

                toast.success(response.data);
                setTimeout(() => {
                    navigate('/dashboard'); // Navigate to '/dashboard' after successful registration
                }, 2000); // Wait for 2 seconds before navigating
            }
        } catch (error) {
            console.error('Error registering user', error);
            toast.error('Registration failed');
        }
    };

    return (
        <Container className="mt-5">
            <ToastContainer />
            <h2>Register</h2>
            <Form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Search Personnel:</label>
                    <input
                        type="text"
                        name="searchTerm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or service number"
                    />
                </div>
                <div className="search-results">
                    {personnel.map((p) => (
                        <div key={p.personnel_id} className="personnel-item">
                            <input
                                type="radio"
                                name="selectedPersonnel"
                                id={`personnel_${p.personnel_id}`}
                                value={p.personnel_id}
                                onChange={() => handlePersonnelSelect(p)}
                                checked={serviceNumber === p.service_number}
                            />
                            <label htmlFor={`personnel_${p.personnel_id}`}>
                                <span>{p.first_name} {p.last_name}</span>
                                <span className="service-number">({p.service_number})</span>
                            </label>
                        </div>
                    ))}
                </div>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formBasicConfirmPassword" className="mt-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formRole" className="mt-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Control
                        as="select"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        disabled
                    >
                        <option value="superadmin">Super Admin</option>
                    </Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                    Register
                </Button>
            </Form>
        </Container>
    );
};

export default Register;
