import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {  doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import profilePic from "../../assets/images/profilepicture.png";
import "./Register.css";
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
  const [categories, setCategories]=useState([])
  const[universities,setUniversities]=useState([])
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
        const storageCard = ref(storage, `StudentsImages/${user.uid}/studentCard/${studentCard.name}`);
        await uploadBytes(storageCard, studentCard);
        cardURL = await getDownloadURL(storageCard);
      }
  
      // העלאת תמונת פרופיל ברירת מחדל
      const response = await fetch(profilePic);
      const profileBlob = await response.blob();
      const storageProfile = ref(storage, `StudentsImages/${user.uid}/studentProfile/defaultProfilePicture.png`);
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
      navigate("/login");
    } catch (error) {
      console.error("Error registering user: ", error);
      setError(error.message);
    }
  };
  
  useEffect(()=>{
    loadCategories(setCategories)
    loadUniversities(setUniversities)
  })

  return (
    <>
      <div className="container-register_page">
        <div className="register-header">
          <h1 className="register-title">בואו נתחיל</h1>
          <p className="register-subtitle">הכניסו את הפרטים כדי להתחיל</p>
        </div>

        <div className="type-selection">
          <button
            className={`btn_register btn__student ${
              userType === "Student" ? "btn-selected" : ""
            }`}
            onClick={() => setUserType("Student")}
          >
            סטודנט
          </button>
          <button
            className={`btn_register btn__company ${
              userType === "Company" ? "btn-selected" : ""
            }`}
            onClick={() => setUserType("Company")}
          >
            חברה
          </button>
        </div>
        {/* */}
        {userType === "" && (
          <>
            <div className="option_header">
              <h2 className="option_title">
                קודם כל, האם את/ה סטודנט/ית או חברה?
              </h2>
              <p className="option_subtitle">בחרו באחד האופציות</p>
            </div>
          </>
        )}
        {/* */}
        <div className="register_form-container">
          {userType && (
            <form className="register_form" onSubmit={handleRegister}>
              {userType === "Student" && (
                <>
                  <div className="form-group">
                    <label htmlFor="inputFirstName">שם פרטי</label>
                    <input
                      type="text"
                      id="inputFirstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="שם פרטי"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputLastName">שם משפחה</label>
                    <input
                      id="inputLastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="שם משפחה"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputLocation">מדינה</label>
                    <input
                      type="text"
                      id="inputLocation"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="מדינה"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputUserDate">תאריך לידה</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      id="inputUserDate"
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputCollege">אוניברסיטה/מכללה</label>
                    <select
                    name="college"
                    id="inputCollege"
                    onChange={(e) => setStudentCollege(e.target.value)}
                    required
                  >
                    <option value=""></option>
                    {
                      universities.map((university)=>{
                        return <option value={university.nameUniversity} key={university.id}>{university.nameUniversity}</option>
                      })
                    }
                  </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputEducation">תחום לימודי</label>
                    <select
                    name="education"
                    id="inputEducation"
                    onChange={(e) => setStudentEducation(e.target.value)}
                    required
                  >
                    <option value=""></option>
                    {
                      categories.map((categorie)=>{
                        return <option value={categorie.nameCategory} key={categorie.id}>{categorie.nameCategory}</option>
                      })
                    }
                  </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputStudentCard">העלאת כרטיס סטודנט</label>
                    <input
                      type="file"
                      id="inputStudentCard"
                      onChange={(e) => setStudentCard(e.target.files[0])}
                      required
                    />
                  </div>

                                  </>
              )}
              {userType === "Company" && (
                <>
                  <div className="form-group">
                    <label htmlFor="inputCompanyName">שם החברה</label>
                    <input
                      type="text"
                      id="inputCompanyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="שם החברה"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputWebsiteCompany">אתר החברה</label>
                    <input
                      type="text"
                      id="inputWebsiteCompany"
                      value={userWebsite}
                      onChange={(e) => setUserWebsite(e.target.value)}
                      placeholder="אתר החברה"
                      required
                    />
                  </div>

                  {/* Contact Person Section */}
                  <div className="form-group full-width">
                    <h2 className="contact-person-title">איש קשר</h2>
                    <hr />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputFirstName">שם פרטי</label>
                    <input
                      type="text"
                      id="inputFirstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="שם פרטי"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputLastName">שם משפחה</label>
                    <input
                      id="inputLastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="שם משפחה"
                      required
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label htmlFor="inputEmail">דואר אלקטרוני</label>
                <input
                  type="email"
                  id="inputEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="דואר אלקטרוני"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">סיסמא</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="סיסמא"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">סיסמא בשנית</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="סיסמא בשנית"
                  required
                />
              </div>

              <button className="btn btn_submit" type="submit">
                הרשמה
              </button>
              {error && <p className="error">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;
