// src/pages/AdminDashboard/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import AddCategory from "../../features/AddCategory/AddCategory";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
    return <div>Loading...</div>;
  }
  if (currentUser.userType !== "Admin") {
    return (
      <div className="not-found-container">
        <div className="not-found-content">
          <h1>Page Not Found</h1>
          <p>Sorry, this page does not exist.</p>
          <Link to={-1} className="go-back-link">Go Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
          <h1>Admin Dashboard</h1>

          {users.map((user) => (
            <>
              {user.userType === "Student" ? (
                <>
                  <h1>Student:</h1>
                  <table>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <td>
                        <img
                          src={user.studentCard}
                          alt="Student Card"
                          style={{ width: "100px", height: "100px" }}
                        />
                      </td>
                      <td>
                        {user.firstName} {user.lastName}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.studentCollege}</td>
                      <td>
                        <button onClick={() => handleApprove(user.id)}>
                          Approve
                        </button>
                        <button onClick={() => handleReject(user.id)}>
                          Reject
                        </button>
                      </td>
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <h1>Company:</h1>
                  <table>
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>WebSite</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <td>{user.companyName}</td>
                      <td>
                        <Link href={user.companyWebsite} />{" "}
                        {user.companyWebsite}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <button onClick={() => handleApprove(user.id)}>
                          Approve
                        </button>
                        <button onClick={() => handleReject(user.id)}>
                          Reject
                        </button>
                      </td>
                    </tbody>
                  </table>
                </>
              )}
            </>
          ))}

          <AddCategory />
      
    </div>
  );
};

export default Dashboard;
