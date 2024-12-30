import React, { useEffect } from "react";
import { Button, Modal } from "antd";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";

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
  userType,
  educations,
  education,
  setEducation,
  setEducations,
}) => {

 useEffect(() => {
    onSnapshot(collection(db, "Categories"), (response) => {
      setEducations(
        response.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
  });

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
            className="bg-blue-500 text-white hover:bg-blue-600"
            disabled={!post.length}
          >
            Post
          </Button>,
        ]}
      >
        <div className="space-y-4">
          {/* כותרת */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              כותרת*
            </label>
            <input
              value={title}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="כותרת*"
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* מיקום */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מיקום*
            </label>
            <input
              value={place}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="מיקום*"
              onChange={(e) => setPlace(e.target.value)}
              required
            />
          </div>

          {/* סוג */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוג
            </label>
            <select
              name="type"
              id="inputType"
              className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setType(e.target.value)}
            >
              <option value="place">{place}</option>
              <option value="Hybride">Hybride</option>
            </select>
          </div>

          <div>
            <label
            className="block text-sm font-medium text-gray-700 mb-2"
             htmlFor="inputEducation">תחום לימודי</label>
            <select
              name="education"
              id="inputEducation"
              onChange={(e) => setEducation(e.target.value)}
              required
            >
              <option value=""></option>
              {educations.map((edu) => {
                return (
                  <option value={edu.nameCategory} key={edu.id}>
                    {edu.nameCategory}
                  </option>
                );
              })}
            </select>
          </div>

          {/* תוכן */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תוכן*
            </label>
            <textarea
              value={post}
              className="w-full p-2 border border-gray-300 rounded-md resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What do you want to talk about?"
              onChange={(e) => setPost(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ModalMission;
