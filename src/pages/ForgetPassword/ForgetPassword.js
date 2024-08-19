import React, { useState } from "react";
import { passwordReset } from "../../config/firebase";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await passwordReset(email);
        setSuccess("You have a message in your email");
      } catch (error) {    
        if (error.code === 'auth/user-not-found') {
          setError('User not found, try again!')
          setEmail('')
        }
      }
  };
  return (
    <>
      <div>
        <h1>Forget Password</h1>
        <form onSubmit={(e) => handleSubmit(e)}>
          <input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          {error != null ? (
            <div>
              <p>{error}</p>
            </div>
          ) : (
            <div>
              <p>{success}</p>
            </div>
          )}
          <button>Send</button>
        </form>
      </div>
    </>
  );
};
export default ForgetPassword;
