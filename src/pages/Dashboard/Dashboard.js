import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import AddCategory from "../../features/AddCategory/AddCategory";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AddUniversity from "../../features/AddUniversity/AddUniversity";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const usersList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => !user.isVerified);
      setUsers(usersList);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleApprove = async (id) => {
    const userDoc = doc(db, "Users", id);
    await updateDoc(userDoc, { isVerified: true });
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleReject = async (id) => {
    const userDoc = doc(db, "Users", id);
    await deleteDoc(userDoc);
    setUsers(users.filter((user) => user.id !== id));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }

 /* if (currentUser.userType !== "Admin") {
    return (
      <div className="not-found-container flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-4">Sorry, this page does not exist.</p>
          <Link to={-1} className="text-blue-600 underline">
            Go Back
          </Link>
        </div>
      </div>
    );
  }*/

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h1>

      {users.map((user) => (
        <div key={user.id} className="mb-8">
          {user.userType === "Student" ? (
            <>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Student</h2>
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Image</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">College</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2">
                      <img
                        src={user.studentCard}
                        alt="Student Card"
                        className="w-20 h-20 rounded-md"
                      />
                    </td>
                    <td className="p-2">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.studentCollege}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Company</h2>
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Company Name</th>
                    <th className="p-2 text-left">Website</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2">{user.companyName}</td>
                    <td className="p-2">
                      <a
                        href={user.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {user.companyWebsite}
                      </a>
                    </td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      ))}

      <div className="mt-8">
        <AddCategory />
      </div>
      <div className="mt-8">
        <AddUniversity />
      </div>
    </div>
  );
};

export default Dashboard;
