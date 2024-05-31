import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLock } from 'react-icons/fa';

const Header = () => {
    const { isAuthenticated, handleLogout } = useAuth();
    const location = useLocation();

    // Determine button text and destination based on current location
    const buttonText = location.pathname.includes('/login') ? 'Sign Up' : isAuthenticated ? 'Logout' : 'Login';
    const buttonDestination = location.pathname.includes('/login') ? '/register' : isAuthenticated ? '/home' : '/login';

    const onClickButton = async () => {
        if (isAuthenticated) {
            await handleLogout();
        }
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
            <Navbar.Brand as={Link} to="/"><FaLock className="white-icon mx-2" />  SFSP</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    {isAuthenticated && <Nav.Link as={Link} to="/upload">Upload</Nav.Link>}
                    {isAuthenticated && <Nav.Link as={Link} to="/files">My Files</Nav.Link>}
                </Nav>
                <Nav className="mx-3">
                    <>
                        <Button variant="outline-light" as={Link} to={buttonDestination} onClick={onClickButton}>
                            {buttonText}
                        </Button>
                    </>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;
