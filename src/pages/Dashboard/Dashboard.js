import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import AddCategory from "../../features/AddCategory/AddCategory";
import AddUniversity from "../../features/AddUniversity/AddUniversity";
import { useAuth } from "../../context/AuthContext";
import ModalCategories from "../../components/Modal/ModalAdminDashboard/ModalCategories/ModalCategories";
const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("newRegistrations");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [onCloseCategory, setOnCloseCategory] = useState(false);
  const [category,setCategory]=useState(null)
  
  
  useEffect(() => {
    const fetchData = async () => {
      const usersSnapshot = await getDocs(collection(db, "Users"));
      const categoriesSnapshot = await getDocs(collection(db, "Categories"));
      const universitiesSnapshot = await getDocs(collection(db, "Universities"));

      setUsers(usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setCategories(categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setUniversities(universitiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
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

  const handleEditCategory=async(category)=>{
    setIsOpenCategory(true)
    setCategory(category)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
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
        <h2 className="text-lg font-medium mb-4 text-center text-gray-700">אפשרויות</h2>
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
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h1>

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
            <AddCategory />
            <h3 className="text-md font-medium mt-6 mb-2">קטגוריות קיימות:</h3>
            <ul className="list-disc pl-6">
            {categories.map((category) => (
  <li key={category.id} className="flex justify-between items-center">
    <span>{category.nameCategory}</span>
    <button
      onClick={() => handleEditCategory(category)}
      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
    >
      Edit
    </button>
  </li>
))}
            </ul>
          </div>
        )}

        {activeTab === "addUniversity" && (
          <div>
            <h2 className="text-lg font-medium mb-4">הוספת אוניברסיטאות</h2>
            <AddUniversity />
            <h3 className="text-md font-medium mt-6 mb-2">אוניברסיטאות קיימות:</h3>
            <ul className="list-disc pl-6">
              {universities.map((university) => (
                <li key={university.id}>{university.nameUniversity}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "statistics" && (
          <div>
            <h2 className="text-lg font-medium mb-4">סטטיסטיקות</h2>
            <p>כאן יוצגו נתונים סטטיסטיים.</p>
          </div>
        )}

        {activeTab === "deleteComments" && (
          <div>
            <h2 className="text-lg font-medium mb-4">מחיקת תגובות</h2>
            <p>כאן תוכל למחוק תגובות.</p>
          </div>
        )}
      </div>
      <ModalCategories
  isOpen={isOpenCategory}
  onClose={() => setIsOpenCategory(false)}
  setCategories={setCategories}
  categories={category}
/>
    </div>
  );
};

export default Dashboard;
