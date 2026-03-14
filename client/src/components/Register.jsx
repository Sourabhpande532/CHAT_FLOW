import { useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axiosInstance";
const Register = ({ setUser }) => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [registerationSuccess, setRegistrationSuccess] = useState(null);

  const handleRegister = async () => {
    if (!username && !password) {
      toast.error("Invalid Credentials");
      return;
    }
    try {
      const { data } = await API.post(`/auth/register`, {
        username,
        password,
      });
      setUser(data);
      toast.success("Register Done! Proceed to login");
      setRegistrationSuccess("You are register successfully. Proceed to login");
    } catch (error) {
      console.error(error.response?.data?.message || "Error registering user");
      setRegistrationSuccess(
        error.response?.data?.message || "Error register user",
      );
    } finally {
      setTimeout(() => setRegistrationSuccess(null), 3000);
    }
  };
  return (
    <div className='card py-5 text-center'>
      <div className='card-body px-5'>
        <h2>Register</h2>
        <p>Not a user yet? Register here</p>
        <input
          type='text'
          placeholder='Enter Username'
          value={username}
          className='form-control form-control-lg mt-3'
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type='password'
          placeholder='Enter password'
          className='form-control form-control-lg mt-3'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleRegister}
          className='btn btn-success btn-lg mt-3'>
          Register
        </button>
        {registerationSuccess && <p>{registerationSuccess}</p>}
      </div>
    </div>
  );
};
export { Register };
