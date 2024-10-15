import React from 'react';
import './home.css';

function TaskEditor({currentId,task,setTask,date,setDate,time,setTime,priority,setPriority,handleEditTask,setIsOpenEditor}) {
    return (
        <>
            <div className="input-area">
                <div className='full-box'>
                    <i className="fa-solid fa-xmark close-btn" onClick={() => setIsOpenEditor(false)}></i>
                    <div className="arrange-input">
                        <div className='d-flex flex-column label-holder'>
                            <label htmlFor="task">Task</label>
                            <input
                                type="text"
                                placeholder="Add Task"
                                id="addTask"
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                            />
                        </div>
                        <div className='d-flex flex-column label-holder'>
                            <label htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="">Select Priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div className='d-flex flex-column label-holder'>
                            <label htmlFor="date">Estimated Finish Date</label>
                            <input
                                placeholder='Finish Date'
                                type="date"
                                name="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className='d-flex flex-column label-holder'>
                            <label htmlFor="time">Estimated Finish Time</label>
                            <input
                                placeholder='Finish Time'
                                type="time"
                                name="time"
                                id="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <button id="search-btn" onClick={() => {handleEditTask(currentId); setIsOpenEditor(false)}}>Save</button>
                </div>
            </div>
        </>
    );
}

export default TaskEditor;
