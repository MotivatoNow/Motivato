import React from 'react';
import { FaBell } from 'react-icons/fa';

const ChatButton = ({ onClick }) => {
    return (
        <button
            className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
            onClick={onClick}
        >
            <FaBell className="mr-2" />
            Message
        </button>
    );
};

export default ChatButton;
