import React from 'react';
import './home.css';

function TaskAdder({task,setTask,date,setDate,time,setTime,priority,setPriority,handleAddTask,setIsOpenAdder}) {
    return (
        <>
            <div className="input-area">
                <div className='full-box'>
                    <i className="fa-solid fa-xmark close-btn" onClick={() => setIsOpenAdder(false)}></i>
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
                            <label htmlFor="time">Estimated Finish Time (24H Format)</label>
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
                    <button id="search-btn" onClick={handleAddTask}>Submit</button>
                </div>
            </div>
        </>
    );
}

export default TaskAdder;
