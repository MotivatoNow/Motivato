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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
  <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
    <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
      Forget Password
    </h1>
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
        />
      </div>

      {error != null ? (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          <p>{error}</p>
        </div>
      ) : (
        <div className="text-sm text-green-600 rounded">
          <p>{success}</p>
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
      >
        Send
      </button>
    </form>
  </div>
</div>

    </>
  );
};
export default ForgetPassword;
