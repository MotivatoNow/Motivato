import React from "react";
import { Button, Modal } from "antd";
import "./Modal.css";
import { useAuth } from "../../../context/AuthContext";

const ModalComponent = ({
  modalOpen,
  setModalOpen,
  setPost,
  post,
  sendPost,
  postImage,
  setPostImage,
  userProfile,
}) => {
  const { currentUser } = useAuth();

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-3">
            {/* Profile Picture */}
            <img
              src={currentUser?.profilePicture || "defaultProfilePictureURL"}
              alt="Profile"
              className="w-10 h-10 rounded-full border border-gray-300"
            />
            {/* Username */}
            <span className="text-lg font-semibold text-gray-700">
              {currentUser?.userName || "שם משתמש"}
            </span>
          </div>
        }
        centered
        open={modalOpen}
        onOk={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        width={700}
        footer={[
          <Button
            onClick={sendPost}
            key="submit"
            type="primary"
            disabled={post.length > 0 || postImage ? false : true}
            className="bg-[#3E54D3] border-none shadow-sm text-white hover:bg-blue-600 px-4 py-2 rounded-lg"
          >
            פרסום
          </Button>,
        ]}
      >
        {/* Textarea for larger input */}
        <textarea
          value={post}
          className="w-48 h-72 md:w-full md:h-96 p-3 mb-4 border-none focus:outline-none rounded-lg resize-none"
          placeholder={`היי ${currentUser.firstName} מה תרצה לשתף?`}
          onChange={(e) => setPost(e.target.value)}
        />

        {/* Button for image upload */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-gray-700 font-medium">העלה תמונה:</label>
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-block bg-[#3E54D3] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-[5px] border-none shadow-sm transition"
          >
            בחר תמונה
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPostImage(e.target.files[0])}
          />
          {postImage && <span className="text-gray-500">{postImage.name}</span>}
        </div>
      </Modal>
    </>
  );
};

export default ModalComponent;
