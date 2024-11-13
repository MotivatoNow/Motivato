import React, { useState } from "react";
import ModalShare from "../Modal/ModalShare/ModalShare";
import { CiShare1 } from "react-icons/ci";

const ShareButton = ({ posts }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const HandleShare = async () => {};

  return (
    <>
      <button
        className="flex py-2 px-3 md:px-10 rounded-[10px] bg-gray-100 items-center space-x-2 text-[#3E54D3]"
        onClick={() => setModalOpen(true)}
      >
        <CiShare1 className="ml-1" />
        <span className='text-gray-800'>שיתוף</span>
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
