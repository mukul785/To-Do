import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function Signup() {
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const handleSignup = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const response = await axios.post(`${API_BASE_URL}/signup`, {
                email: email,
                password: password
            }, { withCredentials: true });
    
            console.log(response.data);
            navigate('/login');
        } catch (error) {
            alert(error.response.data);
            console.error('Signup failed:', error.response ? error.response.data : error);
        }
    };

    return (
        <div>
            <div className="top">
                <div className="heading">
                    <p>Task Scheduler</p>
                </div>
            </div>
            <form onSubmit={handleSignup}>
                <div className="main">
                    <div className="signup">
                        <div className="orgname">
                            <h2>Signup</h2>
                        </div>
                        <div>
                            <div className="Email">
                                <input
                                    type="email"
                                    name='email'
                                    placeholder="Email"
                                    required
                                />
                            </div>
                            <div className="Password">
                                <input
                                    type="password"
                                    name='password'
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <button className='auth-btn' type="submit">
                                <p>Sign up</p>
                            </button>
                            <div className="linker">
                                <span className="switch">
                                    <a href="/login">Go to Login</a>
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

export default Signup;
