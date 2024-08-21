import React from "react";
import {Button, Modal} from "antd";
import "./Modal.css";

const ModalComponent = ({modalOpen, setModalOpen, setPost, post, sendPost}) => {
    return (
        <>
            <Modal
                title="Create a post"
                centered
                open={modalOpen}
                onOk={() => setModalOpen (false)}
                onCancel={() => setModalOpen (false)}
                footer={[
                    <Button onClick={sendPost} key="submit" type="primary" disabled={post.length > 0 ? false : true}>
                        Post
                    </Button>,
                ]}
            >
                <input
                    value={post}
                    className="modal-input"
                    placeholder="What do you want to talk about?"
                    onChange={(e) => setPost (e.target.value)}
                />

            </Modal>
        </>
    );
};
export default ModalComponent;
