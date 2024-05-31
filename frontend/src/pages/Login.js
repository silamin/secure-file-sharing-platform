import React, { useState } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { handleLogin, authError } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username === '' || password === '') {
            setError('Please fill in both fields');
            return;
        }

        const credentials = { username, password };

        try {
            await handleLogin(credentials);
            setError('');
            toast.success('Login successful');
            navigate('/');
        } catch (error) {
            if (error.response) {
                // Check for specific status codes
                if (error.response.status === 401) {
                    toast.error('Invalid username or password');
                    setError('Invalid username or password');
                } else {
                    toast.error('Internal server error');
                    setError('Internal server error');
                }
            } else {
                // Handle network or other errors
                toast.error('An error occurred. Please try again later.');
                setError('An error occurred. Please try again later.');
            }
            console.error('Login error:', error); // Log the error for debugging
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
            <Card className="p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="mb-4 text-center">Login</h2>
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

                    <Button variant="primary" type="submit" className="w-100">
                        Login
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default Login;
