import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import generatePassword from 'generate-password';

const Auth = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mfaToken, setMfaToken] = useState('');
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [userId, setUserId] = useState(null);

    const [error, setError] = useState('');
    const { handleRegister, handleLogin, verifyMfa, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username === '' || password === '' || (isRegister && confirmPassword === '')) {
            setError('Please fill in all fields');
            return;
        }
        if (isRegister && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        const user = { username, password };

        try {
            if (isRegister) {
                await handleRegister(user);
                setError('');
                toast.success('Sign up successful');
            } else {
                const userId = await handleLogin(user);
                setError('');
                if (userId !== null) {
                    setMfaEnabled(true);
                    setUserId(userId)
                }
                else {
                    toast.success('Login successful.');
                }
            }
        } catch (error) {
            handleError(error);
        }
    };

    const handleMfaSubmit = async (e) => {
        e.preventDefault();
        try {
            await verifyMfa({ token: mfaToken, userId: userId });
            toast.success('MFA verified');
            navigate('/');
        } catch (error) {
            setError('Invalid MFA token');
        }
    };

    const handleError = (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                toast.error('Invalid username or password');
                setError('Invalid username or password');
            } else {
                toast.error('Internal server error');
                setError('Internal server error');
            }
        } else {
            toast.error('An error occurred. Please try again later.');
            setError('An error occurred. Please try again later.');
        }
        console.error('Error:', error);
    };

    const generateAndCopyPassword = () => {
        const strongPassword = generatePassword.generate({
            length: 12,
            numbers: true,
            symbols: true,
            uppercase: true,
            lowercase: true,
        });
        setPassword(strongPassword);
        setConfirmPassword(strongPassword);

        navigator.clipboard.writeText(strongPassword).then(() => {
            toast.success('Strong password generated and copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy password to clipboard.');
        });
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
            <Card className="p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="mb-4 text-center">{isRegister ? 'Register' : mfaEnabled ? 'Verify MFA' : 'Login'}</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={isRegister ? handleSubmit : mfaEnabled ? handleMfaSubmit : handleSubmit}>
                    {!mfaEnabled && (
                        <>
                            <Form.Group controlId="formBasicEmail" className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword" className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Form.Group>

                            {isRegister && (
                                <Form.Group controlId="formBasicConfirmPassword" className="mb-3">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </Form.Group>
                            )}
                        </>
                    )}

                    {mfaEnabled && !isRegister && (
                        <Form.Group controlId="formBasicMfaToken" className="mb-3">
                            <Form.Label>MFA Token</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter MFA token"
                                value={mfaToken}
                                onChange={(e) => setMfaToken(e.target.value)}
                            />
                        </Form.Group>
                    )}

                    {isRegister && (
                        <>
                            <Button variant="primary" type="submit" className="w-100 mb-2">
                                Register
                            </Button>
                            <Button variant="secondary" type="button" className="w-100" onClick={generateAndCopyPassword}>
                                Generate Strong Password
                            </Button>
                        </>
                    )}

                    {!isRegister && (
                        <Button variant="primary" type="submit" className="w-100">
                            {mfaEnabled ? 'Verify MFA' : 'Login'}
                        </Button>
                    )}
                </Form>

                {!mfaEnabled && (
                    <Button variant="link" onClick={() => setIsRegister(!isRegister)} className="mt-3">
                        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}</Button>
                )}
            </Card>
        </Container>
    );
};

export default Auth;
