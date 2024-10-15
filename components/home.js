import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import TaskAdder from './TaskAdder';
import './home.css';
import TaskEditor from './TaskEditor';
import Delete from './Delete';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
function Home() {
    const [email, setEmail] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenAdder, setIsOpenAdder] = useState(false);
    const [currentId, setCurrentId] = useState('');
    const [isOpenEditor, setIsOpenEditor] = useState(false);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [username, setUsername] = useState('');
    const [task, setTask] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [priority, setPriority] = useState('');
    const [tasks, setTasks] = useState([]);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchTasks = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/tasks`, { withCredentials: true });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error.response ? error.response.data : error.message);
        }
    }, []);

    function getFirstAlphabetOfEmail(email) {
        const [username] = email.split('@');
        const firstAlphabet = username.match(/[a-zA-Z]/);
        return firstAlphabet ? firstAlphabet[0].toUpperCase() : 'U';
    }

    useEffect(() => {
        axios.get(`${API_BASE_URL}/protected`, { withCredentials: true })
            .then(response => {
                console.log('Authenticated:', response.data);
                fetchTasks();
            })
            .catch(error => {
                console.error('Not authenticated:', error.response ? error.response.data : error);
                navigate('/login');
            });
    }, [fetchTasks, navigate]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/user/email`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.email) {
                    setEmail(data.email);
                    setUsername(getFirstAlphabetOfEmail(data.email));
                }
            })
            .catch(error => {
                console.error('Error fetching user email:', error);
            });
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    function handleLogout() {
        axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true })
            .then(() => {
                Cookies.remove('token');
                navigate('/login');
            })
            .catch(error => {
                console.error('Error logging out:', error);
            });
    }
    const handleAddTask = async () => {
        if (!task) {
            alert('Task cannot be empty!');
            return;
        }

        const newTask = {
            task,
            finishDate: date || 'Not Set',
            finishTime: time || 'Not Set',
            priority: priority || 'Medium',
            completed: false,
        };

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/tasks`,
                newTask,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            fetchTasks();
            setTask('');
            setDate('');
            setTime('');
            setPriority('');
            setIsOpenAdder(false);
            console.log('Task added successfully:', response.data);

        } catch (error) {
            console.error('Error adding task:', error.response ? error.response.data : error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            alert('Failed to add task');
        }
    };
    const handleEditTask = async (currentId) => {
        if (!task) {
            alert('Task cannot be empty!');
            return;
        }

        const updatedTask = {
            task,
            finishDate: date || 'Not Set',
            finishTime: time || 'Not Set',
            priority: priority || 'Medium',
            completed: false,
        };

        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/tasks/${currentId}`, 
                updatedTask,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            fetchTasks();
            setTask('');
            setDate('');
            setTime('');
            setPriority('');
            setIsOpenAdder(false);
            console.log('Task updated successfully:', response.data);
        } catch (error) {
            console.error('Error editing task:', error.response ? error.response.data : error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            alert('Failed to update task');
        }
    };

    const handleToggleCompletion = async (taskId, isCompleted) => {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/api/tasks/${taskId}`,
                { completed: isCompleted },
                { withCredentials: true }
            );
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task._id === taskId ? { ...task, completed: isCompleted } : task
                )
            );
            console.log('Task status updated successfully:', response.data);
        } catch (error) {
            console.error('Error updating task status:', error.response ? error.response.data : error.message);
            alert('Failed to update task status');
        }
    };
    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`, {
                withCredentials: true,
            });
            setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
            console.log(`Task ${taskId} deleted successfully`);
        } catch (error) {
            console.error('Error deleting task:', error.response ? error.response.data : error.message);
            alert('Failed to delete task');
        }
    };

    return (
        <>
            {isOpenAdder &&
                (<TaskAdder task={task} setTask={setTask} date={date} setDate={setDate} time={time} setTime={setTime} priority={priority} setPriority={setPriority} handleAddTask={handleAddTask} setIsOpenAdder={setIsOpenAdder} />)
            }
            {isOpenEditor &&
                (<TaskEditor currentId={currentId} task={task} setTask={setTask} date={date} setDate={setDate} time={time} setTime={setTime} priority={priority} setPriority={setPriority} handleEditTask={handleEditTask} setIsOpenEditor={setIsOpenEditor} />)
            }
            {isOpenDelete &&
                (<Delete currentId={currentId} setIsOpenDelete={setIsOpenDelete} handleDeleteTask={handleDeleteTask} />)
            }
            <nav>
                <div className="title cen">
                    Task Scheduler
                </div>
                <div className="profile-section cen" ref={dropdownRef}>
                    <button className="profile cen" onClick={() => setIsOpen(!isOpen)}>
                        {username}
                    </button>
                    {isOpen && (<>
                        <div className="logout-menu cen">
                            <div>
                                <div className="mail">{email}</div>
                                <div className="divider"></div>
                                <i className="fa-solid fa-arrow-right-from-bracket with-btn"></i>
                                <button onClick={handleLogout} className='logout-btn with-btn'>Logout</button>
                            </div>
                        </div>
                    </>)}
                </div>
            </nav>
            <div className="search-area">
                <button id="search-btn" onClick={() => setIsOpenAdder(true)}><span>Add new Task</span><i className="fa-solid fa-circle-plus ms-2"></i></button>
                <input type="text" placeholder="Search Task" id="searchTask" />
                <i className="fa-solid fa-magnifying-glass s-icon"></i>
            </div>
            <div className="task-cards">
                {tasks.length === 0 ? (
                    <div className='no-task'>No Task Added yet</div>
                ) : (
                    tasks.map((taskItem, index) => (
                        <div className="task-card" key={index}>
                            <p className='main-task'><strong>Task:</strong> {taskItem.task}</p>
                            {taskItem.finishDate && taskItem.finishDate !== 'No date' && (
                                <p><strong>Date:</strong> {taskItem.finishDate}</p>
                            )}
                            {taskItem.finishTime && taskItem.finishTime !== 'No time' && (
                                <p><strong>Time:</strong> {taskItem.finishTime}</p>
                            )}
                            <p className="priority-btn">
                                <strong>Priority:</strong> {taskItem.priority}
                            </p>
                            <p
                                className={`mark-complete-btn ${taskItem.completed ? 'completed' : ''}`}
                                onClick={() => handleToggleCompletion(taskItem._id, !taskItem.completed)}
                            >
                                {taskItem.completed ? 'Completed' : 'Mark as Completed'}
                            </p>
                            <p className='on-created-data'>Created at: {taskItem.dateAdded} at {taskItem.timeAdded}</p>
                            <button onClick={() => {
                                setCurrentId(taskItem._id)
                                setIsOpenDelete(true)
                            }} className='delete-task-btn'>Delete</button>
                            <button onClick={() => {
                                setCurrentId(taskItem._id)
                                setTask(taskItem.task)
                                setPriority(taskItem.priority)
                                setDate(taskItem.date)
                                setTime(taskItem.time)
                                setIsOpenEditor(true)
                            }} className='edit-task-btn'>Edit</button>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

export default Home;
