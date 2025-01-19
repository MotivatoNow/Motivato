import React, { useState } from "react";
import { passwordReset } from "../../config/firebase";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // בדיקת אימייל תקף
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("אנא הזן כתובת אימייל תקפה");
      setSuccess(null);
      return;
    }

    try {
      await passwordReset(email);
      setSuccess("נשלחה הודעה לאימייל שלך לצורך איפוס סיסמה");
      setError(null);
      setEmail("");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("משתמש לא נמצא, נסה שוב!");
      } else {
        setError("אירעה שגיאה, נסה שנית");
      }
      setSuccess(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center text-[#3E54D3] mb-6">
            שחזור סיסמה
          </h1>
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div className="form-control">
              <label htmlFor="email" className="label">
                <span className="label-text">כתובת אימייל</span>
              </label>
              <input
                id="email"
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="הכנס את כתובת האימייל שלך"
                className="input input-bordered w-full"
              />
            </div>

            {error && (
              <div className="alert alert-error shadow-lg">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="alert alert-success shadow-lg">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m-6 6h10M9 5h10"
                    />
                  </svg>
                  <span>{success}</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn bg-[#3E54D3] w-full">
              שלח
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
