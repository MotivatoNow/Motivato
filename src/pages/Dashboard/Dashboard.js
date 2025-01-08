import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import AddCategory from "../../features/AddCategory/AddCategory";
import AddUniversity from "../../features/AddUniversity/AddUniversity";
import { useAuth } from "../../context/AuthContext";
import ModalCategories from "../../components/Modal/ModalAdminDashboard/ModalCategories/ModalCategories";
import ModalUniversity from "../../components/Modal/ModalAdminDashboard/ModalUniversity/Modaluniversity";
import { deleteComment } from "../../hooks/useContentActions";
import { Link } from "react-router-dom";



const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("newRegistrations");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [category, setCategory] = useState(null);
  const [isOpenUniversity, setIsOpenUniversity] = useState(false);
  const [university, setUniversity] = useState(null);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    likes: 0,
    comments: 0,
    missions: 0,
    applications: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "Users"));
        const categoriesSnapshot = await getDocs(collection(db, "Categories"));
        const universitiesSnapshot = await getDocs(
          collection(db, "Universities")
        );
        const postsSnapshot = await getDocs(collection(db, "Posts"));
        const likesSnapshot = await getDocs(collection(db, "Likes"));
        const commentsSnapshot = await getDocs(collection(db, "Comments"));
        const missionsSnapshot = await getDocs(collection(db, "Missions"));
        const applicationsSnapshot = await getDocs(
          collection(db, "Applications")
        );

        setUsers(
          usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setCategories(
          categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setUniversities(
          universitiesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        const unsubscribe = onSnapshot(collection(db, "Comments"), (snapshot) => {
          const updatedComments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setComments(updatedComments);
        });
    

        setStats({
          users: usersSnapshot.size,
          posts: postsSnapshot.size,
          likes: likesSnapshot.size,
          comments: commentsSnapshot.size,
          missions: missionsSnapshot.size,
          applications: applicationsSnapshot.size,
        });

        setLoading(false);
        return ()=>unsubscribe
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  //New Registration Users.
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

  //All users - function to delete
  const handleDeleteUser = async (id) => {
    const userDoc = doc(db, "Users", id);
    await deleteDoc(userDoc);
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleEditCategory = async (category) => {
    setIsOpenCategory(true);
    setCategory(category);
  };
  const handleDeleteCategory = async (id) => {
    const categoryDoc = doc(db, "Categories", id);
    await deleteDoc(categoryDoc);
    setCategories(categories.filter((category) => category.id !== id));
  };
  const handleEditUniversity = async (university) => {
    setIsOpenUniversity(true);
    setUniversity(university);
  };
  const handleDeleteUniversity = async (id) => {
    const universityDoc = doc(db, "Universities", id);
    await deleteDoc(universityDoc);
    setUniversities(universities.filter((university) => university.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">טוען...</div>
    );
  }

  if (currentUser.userType !== "Admin") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-4">Sorry, this page does not exist.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "newRegistrations", label: "נרשמים חדשים" },
    { id: "allUsers", label: "כל המשתמשים" },
    { id: "addCategory", label: "הוספת קטגוריות" },
    { id: "addUniversity", label: "הוספת אוניברסיטאות" },
    { id: "statistics", label: "סטטיסטיקות" },
    { id: "deleteComments", label: "מחיקת תגובות" },
  ];

  return (
    <div className="flex h-screen">
      {/* Tabs Navigation */}
      <div className="w-1/4 bg-gray-100 p-4 border-l border-gray-200">
        <h2 className="text-lg font-medium mb-4 text-center text-gray-700">
          אפשרויות
        </h2>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`block w-full text-right px-4 py-2 rounded-md mb-2 ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Content Area */}
      <div className="w-3/4 p-6 overflow-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Admin Dashboard
        </h1>

        {activeTab === "newRegistrations" && (
          <div>
            <h2 className="text-lg font-medium mb-4">נרשמים חדשים</h2>
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">תמונה</th>
                  <th className="p-2 text-left">שם</th>
                  <th className="p-2 text-left">אימייל</th>
                  <th className="p-2 text-left">מכללה</th>
                  <th className="p-2 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((user) => !user.isVerified)
                  .map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-2">
                        <img
                          src={user.studentCard}
                          alt="Student Card"
                          className="w-20 h-20 rounded-md"
                        />
                      </td>
                      <td className="p-2">{user.userName}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.studentCollege}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-green-600"
                        >
                          אשר
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                        >
                          מחק
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "allUsers" && (
          <div>
            <h2 className="text-lg font-medium mb-4">כל המשתמשים</h2>
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">שם</th>
                  <th className="p-2 text-left">אימייל</th>
                  <th className="p-2 text-left">פרופיל</th>
                  <th className="p-2 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2">{user.userName}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      <a
                        href={`/profile/${user.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        פרופיל
                      </a>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                      >
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "addCategory" && (
          <div>
            <h2 className="text-lg font-medium mb-4">הוספת קטגוריות</h2>
            <AddCategory setCategories={setCategories} />
            <h3 className="text-md font-medium mt-6 mb-2">קטגוריות קיימות:</h3>
            <ul className="list-disc pl-6">
              {categories.length > 0 ? (
                <ul className="list-disc pl-6">
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className="flex justify-between items-center mt-3"
                    >
                      <span>{category.nameCategory}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          מחיקת קטגוריה
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-4">אין קטגוריות זמינות.</p>
              )}
            </ul>
          </div>
        )}

        {activeTab === "addUniversity" && (
          <div>
            <h2 className="text-lg font-medium mb-4">הוספת אוניברסיטאות</h2>
            <AddUniversity setUniversities={setUniversities} />
            <h3 className="text-md font-medium mt-6 mb-2">
              אוניברסיטאות קיימות:
            </h3>
            <ul className="list-disc pl-6">
              {universities.map((university) => (
                <li
                  key={university.id}
                  className="flex justify-between items-center mt-3"
                >
                  <span>{university.nameUniversity}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditUniversity(university)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUniversity(university.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                      מחיקת מוסד לימודי
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "statistics" && (
          <div>
            <h2 className="text-lg font-medium mb-4">סטטיסטיקות</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Utilisateurs</h3>
                <p>{stats.users}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Publications</h3>
                <p>{stats.posts}</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Likes</h3>
                <p>{stats.likes}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Commentaires</h3>
                <p>{stats.comments}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Missions</h3>
                <p>{stats.missions}</p>
              </div>
              <div className="bg-teal-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Candidatures</h3>
                <p>{stats.applications}</p>
              </div>
            </div>
          </div>
        )}

{activeTab === "deleteComments" && (
  <div>
    <h2 className="text-lg font-medium mb-4">מחיקת תגובות</h2>
    <table className="w-full border border-gray-200 rounded-lg">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">Auteur</th>
          <th className="p-2 text-left">Commentaire</th>
          <th className="p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {comments.map((comment) => (
          <tr key={comment.id} className="border-t">
            <Link to={`/post/${comment.postId}`} className="hover:text-blue-600"><td className="p-2">{comment.commentUserName}</td>
            <td className="p-2">{comment.comment}</td>
            <td className="p-2">
              {comment.commentImage && (
                <img src={comment.commentImage} alt="Commentaire" className="w-20 h-20 object-cover rounded-md" />
              )}
            </td>
            </Link>
            <td className="p-2">
              <button
                onClick={() => deleteComment(comment.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
              >
                מחק
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      </div>
      <ModalCategories
        isOpen={isOpenCategory}
        onClose={() => setIsOpenCategory(false)}
        setCategories={setCategories}
        categories={category}
      />
      <ModalUniversity
        isOpen={isOpenUniversity}
        onClose={() => setIsOpenUniversity(false)}
        setUniversity={setUniversities}
        universities={university}
      />
    </div>
  );
};

export default Dashboard;
