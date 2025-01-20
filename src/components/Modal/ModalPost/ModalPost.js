import React from "react";
import { Button, Modal } from "antd";
import { useAuth } from "../../../context/AuthContext";
import { MdDeleteOutline } from "react-icons/md";
import { CiCamera } from "react-icons/ci";

const ModalPost = ({
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

  const deleteImage = (postImage) => {
    setPostImage("");
  };
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
          placeholder={`היי ${currentUser.userName} מה תרצה לשתף?`}
          onChange={(e) => setPost(e.target.value)}
          
        />
        

        {/* Button for image upload */}
        <div className="flex items-center gap-4 mb-4">
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-block bg-[#3E54D3] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-[5px] border-none shadow-sm transition"
          >
            <CiCamera size={24} />
            
          </label>

          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPostImage(e.target.files[0])}
          />
          {postImage && (
           <div className="relative flex items-center justify-center text-gray-500 bg-gray-100 py-2 px-4 rounded-[5px] border-none shadow-sm cursor-pointer">
             
            {postImage &&(<><img src={postImage} className="h-6 w-6"/></>)}
            <span className="absolute top-1 right-0">
              {postImage.name}
              <MdDeleteOutline
                onClick={() => deleteImage(postImage)}
                size={20}
              />
            </span>
            </div>
          )}
          {/*  */}
        </div>
      </Modal>
    </>
  );
};

export default ModalPost;
