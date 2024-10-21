import React from "react";
import { Button, Modal } from "antd";

const ModalMission = ({
  modalOpen,
  setModalOpen,
  setPost,
  post,
  sendMission,
  title,
  setTitle,
  place,
  setPlace,
  type,
  setType,
}) => {
  return (
    <>
      <Modal
        title="Create a Mission"
        centered
        open={modalOpen}
        onOk={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button
            onClick={sendMission}
            key="submit"
            type="primary"
            disabled={post.length > 0 ? false : true}
          >
            Post
          </Button>,
        ]}
      >
        <input
          value={title}
          className="modal-input"
          placeholder="Title*"
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          value={place}
          className="modal-input"
          placeholder="Place*"
          onChange={(e) => setPlace(e.target.value)}
          required
        />
        <select
          name="type"
          id="inputType"
          onChange={(e) => setType(e.target.value)}
        >
          <option value="place">{place}</option>
          <option value="Hybride">Hybride</option>
        </select>
        <input
          value={post}
          className="modal-input"
          placeholder="What do you want to talk about?"
          onChange={(e) => setPost(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default ModalMission;
