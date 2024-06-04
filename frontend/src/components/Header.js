import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Button, NavDropdown, Modal, Form } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLock, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Header = () => {
    const { isAuthenticated, handleLogout, enableMfa, disableMfa, checkMfa } = useAuth();
    const location = useLocation();
    const [showQRCode, setShowQRCode] = useState(false);
    const [mfaCheckbox, setMfaCheckbox] = useState(false);
    const [mfaQrCode, setMfaQrCode] = useState('');

    const buttonText = isAuthenticated ? 'Logout' : location.pathname === '/auth' ? 'Home' : 'Login / Sign Up';
    const buttonDestination = isAuthenticated ? '/home' : location.pathname === '/auth' ? '/' : '/auth';

    const onClickLogout = async () => {
        if (isAuthenticated) {
            try {
                await handleLogout();
                toast.success('Logout successful');
            } catch (error) {
                console.error('Error logging out:', error);
                throw error;
            }
        }
    };
    useEffect(() => {
        async function fetchData() {
            const mfaEnabled = await checkMfa();
            setMfaCheckbox(mfaEnabled);
        }
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);


    const onMfaCheckboxChange = async (event) => {
        const isChecked = event.target.checked;
        setMfaCheckbox(isChecked);
        if (isChecked) {
            try {
                const mfaQrCode = await enableMfa();
                toast.success('MFA enabled');
                setMfaQrCode(mfaQrCode);
                setShowQRCode(true);
            } catch (error) {
                console.error('Error enabling mfa:', error);
                throw error;
            }
        } else {
            try {
                await disableMfa();
                toast.success('MFA disabled');
            } catch (error) {
                console.error('Error disabling mfa:', error);
                throw error;
            }
        }
    };

    const onCloseQRCode = () => {
        setShowQRCode(false);
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
                    {isAuthenticated ? (
                        <NavDropdown title={<><FaUser /> Account</>} id="basic-nav-dropdown" align="end">
                            <Form.Check
                                type="checkbox"
                                label="Enable MFA"
                                checked={mfaCheckbox}
                                onChange={onMfaCheckboxChange}
                                className="mx-3"
                            />
                            <NavDropdown.Item onClick={onClickLogout}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    ) : (
                        <Button variant="outline-light" as={Link} to={buttonDestination} onClick={onClickLogout}>
                            {buttonText}
                        </Button>
                    )}
                </Nav>
            </Navbar.Collapse>
            <Modal show={showQRCode} onHide={onCloseQRCode}>
                <Modal.Header closeButton>
                    <Modal.Title>MFA QR Code</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {mfaQrCode && (
                        <div className="text-center qr-code-container">
                            <img src={mfaQrCode} alt="MFA QR Code" />
                            <p className="text-center qr-code-instructions">
                                Scan this code using an authenticator app like Google Authenticator, Authy, or similar.
                            </p>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </Navbar>
    );
};

export default Header;
