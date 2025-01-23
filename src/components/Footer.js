import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer bg-#023969 mt-5 p-4 text-center">
            <Container>
                <Row>
                    <Col>
                        <p className='text text-light'>&copy; {new Date().getFullYear()} HR Management System. All rights reserved.</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
