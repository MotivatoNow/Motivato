import React from "react";
import { Button, Modal } from "antd";
import "./Modal.css";


const ModalComponent = ({ modalOpen, setModalOpen, setPost, post, sendPost,postImage,setPostImage }) => {
    
    return (
        <>
            <Modal
            title="Create a Post"
            centered
            open={modalOpen}
            onOk={() => setModalOpen(false)}
            onCancel={() => setModalOpen(false)}
            footer={[
                <Button
                    onClick={sendPost}
                    key="submit"
                    type="primary"
                    disabled={post.length > 0 || postImage ? false : true} // Active le bouton si du texte ou une image est présent
                >
                    Post
                </Button>,
            ]}
        >
                <input
                value={post}
                className="modal-input"
                placeholder="What do you want to talk about?"
                onChange={(e) => setPost(e.target.value)}
            />
            
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setPostImage(e.target.files[0])}
            />
            </Modal>
        </>
    );
};

export default ModalComponent;
