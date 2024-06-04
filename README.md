# Secure File Sharing Platform

## Synopsis
The aim of this project is to develop a secure file sharing platform that ensures the confidentiality, integrity, and availability of shared files. The platform is designed to provide robust security measures to protect user data from unauthorized access and potential breaches, ensuring a secure environment for file sharing over the internet.

## Problem Formulation
Secure file sharing is essential in the digital era for both personal and professional use. This project focuses on building a secure file sharing platform using React for the frontend and an Express application with a local MongoDB for the backend. The platform incorporates multiple security measures to ensure data protection and user privacy.

## Project Description
### Introduction
In the current digital era, secure file sharing is essential for both personal and professional use. This project focuses on building a secure file sharing platform using React for the frontend and an Express application with a local MongoDB for the backend. The platform incorporates multiple security measures to ensure data protection and user privacy.

### Setup and Installation
#### Prerequisites
- Node.js and npm
- MongoDB

#### Backend Setup
1. Navigate to the backend folder.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the backend folder with the following environment variables:
    ```
    JWT_SECRET=your_jwt_secret
    DB_URL=your_mongodb_url
    SECRET_KEY=your_secret_key
    ```
4. Start the backend server using `npm start`.

#### Frontend Setup
1. Navigate to the frontend folder.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the frontend folder with the following environment variables:
    ```
    REACT_APP_BASE_URL=http://localhost:5000/api
    ```
4. Start the frontend using `npm start`.

### Security Considerations
#### Authentication and Authorization
- Multi-factor authentication (MFA) can be enabled from user settings.
- User passwords are hashed using bcrypt before storage.
- JSON Web Tokens (JWT) are used for session management, with tokens generated upon login and registration.
- The token is stored in HTTP-only cookies to prevent access from the frontend and XSS.
- Middleware is used to protect certain routes from unauthorized access. Below is an example of my authentication middleware:
