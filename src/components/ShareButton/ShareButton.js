import React, { useState } from "react";
import ModalShare from "../Modal/ModalShare/ModalShare";
import { CiShare1 } from "react-icons/ci";

const ShareButton = ({ posts }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const HandleShare = async () => {};

  return (
    <>
      <button
        className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
        onClick={() => setModalOpen(true)}
      >
        <CiShare1 className="ml-1" />
        <span className='text-gray-300'>שיתוף</span>
      </button>

      <ModalShare
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        postsId={posts.id}
      />
    </>
  );
};

export default ShareButton;
