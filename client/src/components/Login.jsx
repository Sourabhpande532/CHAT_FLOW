import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const handleLogin = async () => {
    try {
      const { data } = await axios.post("http://localhost:5001/auth/login", {
        username,
        password,
      });
      setUser(data);
      toast.success("Login Successfully");
    } catch (error) {
      console.error(error.response?.data?.message || "Error logging in");
      setStatus(error.response?.data?.message || "Error logging in");
    } finally {
      setTimeout(() => setStatus(null), 3000);
    }
  };
  return (
    <div className='card py-5 text-center'>
      <div className='card-body px-5'>
        <h2>Login</h2>
        <p>Login with your credentials to continue</p>
        <input
          type='text'
          value={username}
          className='form-control form-control-lg mt-3'
          placeholder='Enter username'
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type='text'
          value={password}
          className='form-control form-control-lg mt-3'
          placeholder='Enter Password'
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className='btn btn-lg btn-success mt-3' onClick={handleLogin}>
          Login
        </button>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
};
export { Login };
