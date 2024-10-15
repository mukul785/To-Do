import React from 'react';
import './home.css';

function Delete({currentId,setIsOpenDelete,handleDeleteTask}) {
    return (
        <>
            <div className="input-area">
                <div className="confirm-box">
                    <div className="confirm-msg">Are you sure you want to delete the Task</div>
                    <div className="reply-area">
                        <button onClick={() => {handleDeleteTask(currentId);setIsOpenDelete(false)}} className='confirm-dlt-btn'>Delete</button>
                        <button onClick={()=>setIsOpenDelete(false)} className='confirm-cancel-btn'>Cancel</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Delete;
