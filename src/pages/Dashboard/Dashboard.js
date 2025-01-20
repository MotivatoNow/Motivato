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
import {
  FaUsers,
  FaPen,
  FaHeart,
  FaComments,
  FaTasks,
  FaFileAlt,
  FaHome,
  FaUser,
  FaCog,
  FaBell,
  FaChartBar,
  FaPlus,
  FaUniversity,
  FaTrashAlt,
} from "react-icons/fa";

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
        const unsubscribe = onSnapshot(
          collection(db, "Comments"),
          (snapshot) => {
            const updatedComments = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setComments(updatedComments);
          }
        );

        setStats({
          users: usersSnapshot.size,
          posts: postsSnapshot.size,
          likes: likesSnapshot.size,
          comments: commentsSnapshot.size,
          missions: missionsSnapshot.size,
          applications: applicationsSnapshot.size,
        });

        setLoading(false);
        return () => unsubscribe;
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
    await updateDoc(userDoc, { isVerified: false, isRejected: true });
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

  const iconMap = {
    newRegistrations: <FaUser />,
    allUsers: <FaUsers />,
    addCategory: <FaPlus />,
    addUniversity: <FaUniversity />,
    statistics: <FaChartBar />,
    deleteComments: <FaTrashAlt />,
  };

  return (
    <div className="flex h-screen">
      {/* Tabs Navigation */}
      <div className="md:w-1/4 w-full bg-base-100 p-4 border-l border-gray-200 shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center text-gray-700">
          אפשרויות
        </h2>
        <div className="menu menu-vertical bg-base-100 rounded-box">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`btn justify-start gap-3 w-full ${
                activeTab === tab.id
                  ? "btn-primary"
                  : "btn-ghost hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-xl">{iconMap[tab.id]}</span> {/* Icon */}
              <span className="flex-grow text-right">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Content Area */}
      <div className="w-3/4 p-6 overflow-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Admin Dashboard
        </h1>

        {activeTab === "newRegistrations" && (
          <div className="overflow-x-auto">
            <h2 className="text-lg font-medium mb-4">נרשמים חדשים</h2>
            <table className="table w-full border border-gray-200 rounded-lg">
              {/* ראש הטבלה */}
              <thead className="bg-gray-100">
                <tr>
                  <th>תמונה</th>
                  <th>שם</th>
                  <th>אימייל</th>
                  <th>מכללה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {/* שורות הטבלה */}
                {users
                  .filter((user) => !user.isVerified)
                  .map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="avatar">
                          <div className="mask mask-squircle w-20 h-20">
                            <img src={user.studentCard} alt="Student Card" />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-bold">{user.userName}</div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.studentCollege}</td>
                      <td>
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="btn btn-success btn-sm mr-2"
                        >
                          אשר
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="btn btn-error btn-sm"
                        >
                          מחק
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
              {/* תחתית הטבלה */}
              <tfoot>
                <tr>
                  <th>תמונה</th>
                  <th>שם</th>
                  <th>אימייל</th>
                  <th>מכללה</th>
                  <th>פעולות</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {activeTab === "allUsers" && (
          <div className="overflow-x-auto">
            <h2 className="text-lg font-medium mb-4">כל המשתמשים</h2>
            <table className="table w-full border border-gray-200 rounded-lg">
              {/* ראש הטבלה */}
              <thead className="bg-gray-100">
                <tr>
                  <th>שם</th>
                  <th>אימייל</th>
                  <th>פרופיל</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {/* שורות הטבלה */}
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <img
                              src={user.profilePicture}
                              alt={`${user.userName} profile picture`}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.userName}</div>
                          <div className="text-sm opacity-50">#{index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <a
                        href={`/profile/${user.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        פרופיל
                      </a>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn btn-ghost btn-xs bg-red-500 text-white hover:bg-red-600"
                      >
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* תחתית הטבלה */}
              <tfoot>
                <tr>
                  <th>שם</th>
                  <th>אימייל</th>
                  <th>פרופיל</th>
                  <th>פעולות</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {activeTab === "addCategory" && (
          <div>
            <h2 className="text-lg font-medium mb-4">הוספת קטגוריות</h2>
            <AddCategory setCategories={setCategories} />
            <h3 className="text-md font-medium mt-6 mb-2">קטגוריות קיימות:</h3>
            <div className="card bg-base-100 shadow-lg p-4">
              {categories.length > 0 ? (
                <ul className="space-y-4">
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div className="flex items-center gap-4">
                        {/* תמונה של הקטגוריה */}
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img
                              src={
                                category.imageURL ||
                                "https://via.placeholder.com/150"
                              }
                              alt={`Category ${category.nameCategory}`}
                            />
                          </div>
                        </div>
                        {/* שם הקטגוריה */}
                        <span className="font-medium">
                          {category.nameCategory}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {/* כפתור עריכה */}
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="btn btn-sm btn-info"
                        >
                          Edit
                        </button>
                        {/* כפתור מחיקה */}
                        <button
                          className="btn btn-sm btn-error"
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
            </div>
          </div>
        )}

        {activeTab === "addUniversity" && (
          <div>
            <h2 className="text-lg font-medium mb-4">הוספת אוניברסיטאות</h2>
            <AddUniversity setUniversities={setUniversities} />
            <h3 className="text-md font-medium mt-6 mb-2">
              אוניברסיטאות קיימות:
            </h3>
            <div className="card bg-base-100 shadow-lg p-4">
              {universities.length > 0 ? (
                <ul className="space-y-4">
                  {universities.map((university) => (
                    <li
                      key={university.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div className="flex items-center gap-4">
                        {/* לוגו של האוניברסיטה */}
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img
                              src={university.logoUniversity}
                              alt={`Logo of ${university.nameUniversity}`}
                            />
                          </div>
                        </div>
                        {/* שם האוניברסיטה */}
                        <span className="font-medium">
                          {university.nameUniversity}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {/* כפתור עריכה */}
                        <button
                          onClick={() => handleEditUniversity(university)}
                          className="btn btn-sm btn-info"
                        >
                          Edit
                        </button>
                        {/* כפתור מחיקה */}
                        <button
                          onClick={() => handleDeleteUniversity(university.id)}
                          className="btn btn-sm btn-error"
                        >
                          מחיקת מוסד לימודי
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-4">אין אוניברסיטאות זמינות.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "statistics" && (
          <div>
            <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
              סטטיסטיקות
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* משתמשים */}
              <div className="card shadow-xl bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
                <div className="card-body items-center text-center">
                  <div className="text-4xl text-blue-800">
                    <FaUsers />
                  </div>
                  <h3 className="text-lg font-bold text-blue-800 mt-2">
                    משתמשים
                  </h3>
                  <p className="stat-value text-blue-600 text-4xl">
                    {stats.users}
                  </p>
                  <div className="stat-desc text-blue-500">סה"כ משתמשים</div>
                </div>
              </div>
              {/* פוסטים */}
              <div className="card shadow-xl bg-gradient-to-br from-green-100 via-green-200 to-green-300">
                <div className="card-body items-center text-center">
                  <div className="text-4xl text-green-800">
                    <FaPen />
                  </div>
                  <h3 className="text-lg font-bold text-green-800 mt-2">
                    פוסטים
                  </h3>
                  <p className="stat-value text-green-600 text-4xl">
                    {stats.posts}
                  </p>
                  <div className="stat-desc text-green-500">סה"כ פוסטים</div>
                </div>
              </div>
              {/* לייקים */}
              <div className="card shadow-xl bg-gradient-to-br from-red-100 via-red-200 to-red-300">
                <div className="card-body items-center text-center">
                  <div className="text-4xl text-red-800">
                    <FaHeart />
                  </div>
                  <h3 className="text-lg font-bold text-red-800 mt-2">
                    לייקים
                  </h3>
                  <p className="stat-value text-red-600 text-4xl">
                    {stats.likes}
                  </p>
                  <div className="stat-desc text-red-500">סה"כ לייקים</div>
                </div>
              </div>
              {/* תגובות */}
              <div className="card shadow-xl bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300">
                <div className="card-body items-center text-center">
                  <div className="text-4xl text-yellow-800">
                    <FaComments />
                  </div>
                  <h3 className="text-lg font-bold text-yellow-800 mt-2">
                    תגובות
                  </h3>
                  <p className="stat-value text-yellow-600 text-4xl">
                    {stats.comments}
                  </p>
                  <div className="stat-desc text-yellow-500">סה"כ תגובות</div>
                </div>
              </div>
              {/* משימות */}
              <div className="card shadow-xl bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
                <div className="card-body items-center text-center">
                  <div className="text-4xl text-purple-800">
                    <FaTasks />
                  </div>
                  <h3 className="text-lg font-bold text-purple-800 mt-2">
                    משימות
                  </h3>
                  <p className="stat-value text-purple-600 text-4xl">
                    {stats.missions}
                  </p>
                  <div className="stat-desc text-purple-500">סה"כ משימות</div>
                </div>
              </div>
              {/* מועמדויות */}
              <div className="card shadow-xl bg-gradient-to-br from-teal-100 via-teal-200 to-teal-300">
                <div className="card-body items-center text-center">
                  <div className="text-4xl text-teal-800">
                    <FaFileAlt />
                  </div>
                  <h3 className="text-lg font-bold text-teal-800 mt-2">
                    מועמדויות
                  </h3>
                  <p className="stat-value text-teal-600 text-4xl">
                    {stats.applications}
                  </p>
                  <div className="stat-desc text-teal-500">סה"כ מועמדויות</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "deleteComments" && (
          <div className="card bg-base-100 shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              מחיקת תגובות
            </h2>
            <div className="overflow-x-auto">
              <table className="table w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">שם המשתמש</th>
                    <th className="text-left p-2">תגובה</th>
                    <th className="text-left p-2">תמונה</th>
                    <th className="text-center p-2">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-gray-50">
                      <td className="p-2">
                        <Link
                          to={`/post/${comment.postId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {comment.commentUserName}
                        </Link>
                      </td>
                      <td className="p-2">{comment.comment}</td>
                      <td className="p-2">
                        {comment.commentImage && (
                          <img
                            src={comment.commentImage}
                            alt="Commentaire"
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="btn btn-error btn-sm"
                        >
                          מחק
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
