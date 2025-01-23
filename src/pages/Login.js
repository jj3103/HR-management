import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/authContext';
import { MdClose } from "react-icons/md";
import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setIsLoggedIn, setUserEmail, setUserRole } = useContext(AuthContext);

    useEffect(() => {
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/users/login', { email, password });

            // Store login status and user role in localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('id', response.data.id);
            localStorage.setItem('service_number', response.data.service_number);

            // Update context
            setIsLoggedIn(true);
            setUserEmail(email);
            setUserRole(response.data.role);

            toast.success('Login successful!');
            navigate('/dashboard'); // Navigate to '/dashboard' after successful login
        } catch (error) {
            console.error('Login Error:', error);
            toast.error('Login failed');
        }
    };

    const handleClose = () => {
        navigate('/'); // Navigate to home or another page
    };

    return (
        <>
            <ToastContainer />
            <div className="login-overlay">
                <Container>
                    <Row className="justify-content-center align-items-center min-vh-100">
                        <Col md={6} lg={4}>
                            <div className="login-card">
                                <div className='close-btn'><MdClose onClick={handleClose} /></div>
                                <h2>Login</h2>
                                <Form onSubmit={handleSubmit}>
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

                                    <Button variant="primary" type="submit" className="mt-3">
                                        Submit
                                    </Button>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default Login;
