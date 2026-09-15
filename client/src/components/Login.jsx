import { useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axiosInstance";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiMsg,   setApiMsg]   = useState(null);

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required";
    if (!password)        e.password = "Password is required";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await API.post(`/auth/login`, { username, password });
      setUser(data);
      toast.success("Welcome back! 👋");
    } catch (error) {
      const msg = error.response?.data?.message || "Error logging in";
      console.error(msg);
      setApiMsg(msg);
    } finally {
      setLoading(false);
      setTimeout(() => setApiMsg(null), 3000);
    }
  };

  return (
    <div className='auth-card-login'>
      <h2>Welcome Back</h2>
      <div className='auth-divider' />
      <p className='auth-subtitle'>Log in to continue your conversations</p>

      {/* Username */}
      <label className='auth-label' htmlFor='login-username'>Username</label>
      <input
        id='login-username'
        type='text'
        value={username}
        className={`form-control${errors.username ? " is-invalid" : ""}`}
        placeholder='Your username'
        onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: "" })); }}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        disabled={loading}
      />
      {errors.username && <span className='auth-field-error'>{errors.username}</span>}

      {/* Password */}
      <label className='auth-label' htmlFor='login-password'>Password</label>
      <input
        id='login-password'
        type='password'
        value={password}
        className={`form-control${errors.password ? " is-invalid" : ""}`}
        placeholder='Your password'
        onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        disabled={loading}
      />
      {errors.password && <span className='auth-field-error'>{errors.password}</span>}

      <div className='auth-spacer' />

      <button className='auth-btn' onClick={handleLogin} disabled={loading}>
        {loading ? "Signing in…" : "Sign In"}
      </button>

      {apiMsg && <p className='auth-status'>{apiMsg}</p>}
    </div>
  );
};

export { Login };
