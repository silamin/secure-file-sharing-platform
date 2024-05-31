import React, { useState } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import generatePassword from 'generate-password';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { handleRegister, authError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username === '' || password === '' || confirmPassword === '') {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        const user = { username, password };

        try {
            await handleRegister(user);
            setError('');
            toast.success('Sign up successful');
            navigate('/');
        } catch (error) {
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
            console.error('Login error:', error);
        }
        setError('');
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
                <h2 className="mb-4 text-center">Register</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
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

                    <Form.Group controlId="formBasicConfirmPassword" className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100 mb-2">
                        Register
                    </Button>
                    <Button variant="secondary" type="button" className="w-100" onClick={generateAndCopyPassword}>
                        Generate Strong Password
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default Register;
