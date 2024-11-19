import React from 'react';
import { FaBell } from 'react-icons/fa';

const ChatButton = ({ onClick }) => {
    return (
        <button
            className="flex items-center justify-center text-white bg-blue-500 px-3 py-3 rounded-[5px]"
            onClick={onClick}
        >
            <FaBell className="ml-2" />
            הודעה
        </button>
    );
};

export default ChatButton;
