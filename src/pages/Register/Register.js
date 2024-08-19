import React, { useState } from 'react';
import { auth, db, storage } from '../../config/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import './Register.css';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import profilePic from '../../assets/images/profilepicture.png';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userType, setUserType] = useState('Student');
    const [userGender, setUserGender] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [studentCollege, setStudentCollege] = useState('');
    const [studentEducation, setStudentEducation] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [studentCard, setStudentCard] = useState(null);
    const [error, setError] = useState('');
    const [isVerify,setIsVerify] = useState(false)

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // העלאת תמונת כרטיס סטודנט
            let cardURL = '';
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

            const userData = {
                uid: user.uid,
                email: email,
                userType: userType,
                profilePicture: profileURL,
                bio: '',
            };

            if (userType === 'Company') {
                userData.companyName = companyName;
                userData.companyWebsite = companyWebsite;
            } else if (userType === 'Student') {
                userData.firstName = firstName;
                userData.dateOfBirth = dateOfBirth;
                userData.userGender = userGender;
                userData.lastName = lastName;
                userData.studentCard = cardURL;
                userData.studentCollege = studentCollege;
                userData.studentEducation = studentEducation;
                userData.isVerify = isVerify;
            }

            await setDoc(doc(db, "Users", user.uid), userData);

            console.log("User registered with ID: ", user.uid);
        } catch (error) {
            console.error("Error registering user: ", error);
            setError(error.message);
        }
    };

    return (
        <>
            <h1 className="header_register">תצטרפו ותהיו מהקהילה הגדולה בישראל</h1>
            <div className="form__register-container">
                <div className="grid_right-side_form">
                    <form className="register_form" onSubmit={handleRegister}>
                        <div className="form-row">
                            <div className="form-group col-md-2">
                                <label htmlFor="inputUserType">סוג משתמש</label>
                                <select className="custom-select form-control" required
                                        value={userType}
                                        id="inputUserType"
                                        onChange={(e) => setUserType(e.target.value)}>
                                    <option selected value="Student">סטודנט(פרילנסר)</option>
                                    <option value="Company">חברה</option>
                                </select>
                            </div>
                        </div>
                        <hr/>
                        {userType === "Student" ? (
                            <>
                                <h4>פרטים אישיים</h4>
                                <hr/>
                                <div className="row">
                                    <div className="form-group col-md-4">
                                        <label htmlFor="inputFirstName">שם פרטי</label>
                                        <input
                                            type="text"
                                            id="inputFirstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="שם פרטי"
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group col-md-4">
                                        <label htmlFor="inputLastName">שם משפחה</label>
                                        <input
                                            id="inputLastName"
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="שם משפחה"
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="row">
                                    <div className="form-group col-md-3">
                                        <label htmlFor="inputCompanyName">שם החברה</label>
                                        <input
                                            type="text"
                                            id="inputCompanyName"
                                            className="form-control"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="שם חברה"
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-3">
                                        <label htmlFor="inputWebsiteCompany"></label>
                                        <input
                                            type="text"
                                            id="inputWebsiteCompany"
                                            className="form-control"
                                            value={companyWebsite}
                                            onChange={(e) => setCompanyWebsite(e.target.value)}
                                            placeholder="אתר החברה"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="form-row">
                            <div className="form-group col-md-3">
                                <label htmlFor="inputEmail">דואר אלקטרוני</label>
                                <input
                                    type="email"
                                    id="inputEmail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="דואר אלקטרוני"
                                    required
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group col-md-3">
                                <label htmlFor="password">סיסמא</label>
                                <input
                                    type="password"
                                    value={password}
                                    id="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="סיסמא"
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group col-md-3">
                                <label htmlFor="confirmPassword">סיסמא בשנית</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="סיסמא בשנית"
                                    className="form-control"
                                    required
                                />
                            </div>
                        </div>
                        {userType === 'Student' && (
                            <>
                                <div className="form-row">
                                    <div className="form-group col-md-2">
                                        <label htmlFor="inputUserType">מין</label>
                                        <select className="custom-select form-control"
                                                value={userGender}
                                                id="typeUserGender"
                                                onChange={(e) => setUserGender(e.target.value)}>
                                            <option selected value="">נא לבחור מין</option>
                                            <option value="Male">זכר</option>
                                            <option value="Female">נקבה</option>
                                            <option value="Other">אחר</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="form-group col-md-3">
                                        <label htmlFor="inputUserDate">תאריך לידה</label>
                                        <input
                                            type="date"
                                            value={dateOfBirth}
                                            id="inputUserDate"
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            placeholder="Date of Birth"
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <hr/>
                                <h4>פרטים לימודיים</h4>
                                <hr/>
                                <div className="row">
                                    <div className="form-group col-md-3">
                                        <label htmlFor="inputCollege">מכללה/אוניברסיטה</label>
                                        <input
                                            id="inputCollege"
                                            className="form-control"
                                            type="text"
                                            value={studentCollege}
                                            onChange={(e) => setStudentCollege(e.target.value)}
                                            placeholder="מכללה/אונברסיטה"
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-3">
                                        <label htmlFor="unputEducation">תחום לימודי</label>
                                        <input
                                            className="form-control"
                                            id='inputEducation'
                                            type="text"
                                            value={studentEducation}
                                            onChange={(e) => setStudentEducation(e.target.value)}
                                            placeholder="תחום לימודי"
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-3">
                                        <label htmlFor="inputStudentCard">העלו כרטיס סטודנט</label>
                                        <input
                                            type="file"
                                            id='inputStudentCard'
                                            className="form-control"
                                            onChange={(e) => setStudentCard(e.target.files[0])}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        <button className="btn btn-primary mb-2" type="submit">הרשמה</button>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;
