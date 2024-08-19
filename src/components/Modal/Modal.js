import React from "react";
import { Button, Modal } from "antd";
import "./Modal.css";

const ModalComponent = ({ modalOpen, setModalOpen,setStatus,status,sendStatus }) => {
  return (
    <>
      <Modal
        title="Create a post"
        centered
        open={modalOpen}
        onOk={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button onClick={sendStatus} key="submit" type="primary" disabled={status.length>0? false:true}>
            Post
          </Button>,
        ]}
      >
        <input
        value={status}
          className="modal-input"
          placeholder="What do you want to talk about?"
            onChange={(e)=>setStatus(e.target.value)}
        />
        
      </Modal>
    </>
  );
};
export default ModalComponent;
