import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../../config/firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import profilePic from "../../assets/images/profilepicture.png";
import { useNavigate } from "react-router-dom";
import { loadCategories } from "../../hooks/useLoadCategories";
import { loadUniversities } from "../../hooks/useLoadUniversities";

const Register = () => {
  const [userType, setUserType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [userWebsite, setUserWebsite] = useState("");
  const [studentCollege, setStudentCollege] = useState("");
  const [studentEducation, setStudentEducation] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [studentCard, setStudentCard] = useState(null);
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [universities, setUniversities] = useState([]);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
 
      // העלאת תמונת כרטיס סטודנט
      let cardURL = "";
      if (studentCard) {
        const storageCard = ref(
          storage,
          `StudentsImages/${user.uid}/studentCard/${studentCard.name}`
        );
        await uploadBytes(storageCard, studentCard);
        cardURL = await getDownloadURL(storageCard);
      }

      // העלאת תמונת פרופיל ברירת מחדל
      const response = await fetch(profilePic);
      const profileBlob = await response.blob();
      const storageProfile = ref(
        storage,
        `StudentsImages/${user.uid}/studentProfile/defaultProfilePicture.png`
      );
      await uploadBytes(storageProfile, profileBlob);
      const profileURL = await getDownloadURL(storageProfile);

      // שמירת הנתונים במסד הנתונים
      const userData = {
        uid: user.uid,
        email: email,
        userType: userType,
        profilePicture: profileURL,
        bio: "",
      };

      if (userType === "Company") {
        userData.companyName = companyName;
        userData.userWebsite = userWebsite;
        userData.userName = companyName;
        userData.firstName = firstName;
        userData.lastName = lastName;
      } else if (userType === "Student") {
        userData.firstName = firstName;
        userData.lastName = lastName;
        userData.dateOfBirth = dateOfBirth;
        userData.studentCard = cardURL;
        userData.studentCollege = studentCollege;
        userData.studentEducation = studentEducation;
        userData.location = location;
        userData.userName = `${firstName} ${lastName}`;
      }

      await setDoc(doc(db, "Users", user.uid), userData);

      console.log("User registered with ID: ", user.uid);
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error registering user: ", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    loadCategories(setCategories);
    loadUniversities(setUniversities);
  });

  return (
    <>
  <div className="min-h-screen bg-base-200 py-10">
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold text-primary">בואו נתחיל</h1>
    <p className="text-lg text-gray-600">הכניסו את הפרטים כדי להתחיל</p>
  </div>

  <div className="flex w-full max-w-3xl mx-auto flex-col lg:flex-row gap-4 px-4">
    <div
      onClick={() => setUserType("Student")}
      className="bg-[#3E54D3] text-white cursor-pointer rounded-box flex items-center justify-center h-32 flex-grow text-xl font-medium shadow-lg hover:bg-primary-focus"
    >
      סטודנט
    </div>
    <div className="divider lg:divider-horizontal">או</div>
    <div
      onClick={() => setUserType("Company")}
      className="bg-accent text-white cursor-pointer rounded-box flex items-center justify-center h-32 flex-grow text-xl font-medium shadow-lg hover:bg-accent-focus"
    >
      חברה
    </div>
  </div>

  {userType === "" && (
    <div className="text-center mt-8">
      <h2 className="text-2xl font-semibold text-primary mb-2">
        קודם כל, האם את/ה סטודנט/ית או חברה?
      </h2>
      <p className="text-gray-600">בחרו באחד האופציות</p>
    </div>
  )}

  {userType && (
    <div className="card bg-white shadow-lg rounded-lg p-8 mt-8 w-full max-w-4xl mx-auto">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleRegister}>
        {userType === "Student" && (
          <>
            <div className="form-control">
              <label htmlFor="inputFirstName" className="label">
                <span className="label-text">שם פרטי</span>
              </label>
              <input
                type="text"
                id="inputFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input input-bordered"
                placeholder="שם פרטי"
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="inputLastName" className="label">
                <span className="label-text">שם משפחה</span>
              </label>
              <input
                type="text"
                id="inputLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input input-bordered"
                placeholder="שם משפחה"
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="inputLocation" className="label">
                <span className="label-text">מדינה</span>
              </label>
              <input
                type="text"
                id="inputLocation"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input input-bordered"
                placeholder="מדינה"
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="inputUserDate" className="label">
                <span className="label-text">תאריך לידה</span>
              </label>
              <input
                type="date"
                id="inputUserDate"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="inputCollege" className="label">
                <span className="label-text">אוניברסיטה/מכללה</span>
              </label>
              <select
                id="inputCollege"
                value={studentCollege}
                onChange={(e) => setStudentCollege(e.target.value)}
                className="select select-bordered"
                required
              >
                <option value="">בחר אוניברסיטה</option>
                {universities.map((university) => {
                        return (
                          <option
                            value={university.nameUniversity}
                            key={university.id}
                          >
                            {university.nameUniversity}
                          </option>
                        );
                      })}
                
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="inputEducation" className="label">
                <span className="label-text">תחום לימודי</span>
              </label>
              <select
                id="inputEducation"
                value={studentEducation}
                onChange={(e) => setStudentEducation(e.target.value)}
                className="select select-bordered"
                required
              >
                <option value="">בחר תחום לימודי</option>
                {categories.map((category) => {
                        return (
                          <option
                            value={category.nameCategory}
                            key={category.id}
                          >
                            {category.nameCategory}
                          </option>
                        );
                      })}
             
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="inputStudentCard" className="label">
                <span className="label-text">העלאת כרטיס סטודנט</span>
              </label>
              <input
                type="file"
                id="inputStudentCard"
                onChange={(e) => setStudentCard(e.target.files[0])}
                className="file-input file-input-bordered"
                required
              />
            </div>
          </>
        )}

        {userType === "Company" && (
          <>
            <div className="form-control">
              <label htmlFor="inputCompanyName" className="label">
                <span className="label-text">שם החברה</span>
              </label>
              <input
                type="text"
                id="inputCompanyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input input-bordered"
                placeholder="שם החברה"
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="inputWebsiteCompany" className="label">
                <span className="label-text">אתר החברה</span>
              </label>
              <input
                type="text"
                id="inputWebsiteCompany"
                value={userWebsite}
                onChange={(e) => setUserWebsite(e.target.value)}
                className="input input-bordered"
                placeholder="אתר החברה"
                required
              />
            </div>

            <div className="form-control md:col-span-2">
              <h2 className="text-lg font-semibold">איש קשר</h2>
              <div className="form-control">
                <label htmlFor="contactFirstName" className="label">
                  <span className="label-text">שם פרטי</span>
                </label>
                <input
                  type="text"
                  id="contactFirstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input input-bordered"
                  placeholder="שם פרטי"
                  required
                />
              </div>

              <div className="form-control">
                <label htmlFor="contactLastName" className="label">
                  <span className="label-text">שם משפחה</span>
                </label>
                <input
                  type="text"
                  id="contactLastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input input-bordered"
                  placeholder="שם משפחה"
                  required
                />
              </div>
            </div>
          </>
        )}

        <div className="form-control md:col-span-2">
          <label htmlFor="inputEmail" className="label">
            <span className="label-text">דואר אלקטרוני</span>
          </label>
          <input
            type="email"
            id="inputEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered"
            placeholder="דואר אלקטרוני"
            required
          />
        </div>

        <div className="form-control">
          <label htmlFor="password" className="label">
            <span className="label-text">סיסמא</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered"
            placeholder="סיסמא"
            required
          />
        </div>

        <div className="form-control">
          <label htmlFor="confirmPassword" className="label">
            <span className="label-text">סיסמא בשנית</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input input-bordered"
            placeholder="סיסמא בשנית"
            required
          />
        </div>

        <div className="md:col-span-2 flex justify-center">
          <button type="submit" className="btn bg-[#3E54D3] hover:bg-[#3E54D3] text-white w-1/2">
            הרשמה
          </button>
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </form>
    </div>
  )}
</div>

    </>
  );
};

export default Register;
