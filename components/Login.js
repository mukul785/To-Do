import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, { 
                email: email,
                password: password
            }, { withCredentials: true });
            console.log(response.data);
            navigate('/todo');
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error);
            alert('Invalid credentials, please try again.');
        }
    };

    return (
        <div>
            <div className="top">
                <div className="heading">
                    <p>Task Scheduler</p>
                </div>
            </div>
            <form onSubmit={handleLogin}>
                <div className="main">
                    <div className="signup">
                        <div className="orgname">
                            <h2>Login</h2>
                        </div>
                        <div>
                            <div className="Email">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    name='email'
                                    required
                                />
                            </div>
                            <div className="Password">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    name='password'
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <button className='auth-btn' type="submit">
                                <p>Login</p>
                            </button>
                            <div className="linker">
                                <span className="switch">
                                    <a href="/signup">Go to Signup</a>
                                </span>
                                <span className="forgot">Forgot Password?</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Login;
