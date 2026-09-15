import { useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axiosInstance";

const Register = ({ setUser }) => {
  const [username, setUserName]   = useState("");
  const [password, setPassword]   = useState("");
  const [loading,  setLoading]    = useState(false);
  const [errors,   setErrors]     = useState({});
  const [apiMsg,   setApiMsg]     = useState(null);
  const [apiOk,    setApiOk]      = useState(false);

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!username.trim())          e.username = "Username is required";
    else if (username.length < 3)  e.username = "At least 3 characters";
    if (!password)                 e.password = "Password is required";
    else if (password.length < 6)  e.password = "At least 6 characters";
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await API.post(`/auth/register`, { username, password });
      setUser(data);
      toast.success("Registered! Welcome aboard 🎉");
      setApiOk(true);
      setApiMsg("Registered successfully. Redirecting…");
    } catch (error) {
      const msg = error.response?.data?.message || "Error registering user";
      console.error(msg);
      setApiOk(false);
      setApiMsg(msg);
    } finally {
      setLoading(false);
      setTimeout(() => setApiMsg(null), 3000);
    }
  };

  return (
    <div className='auth-card-register'>
      <h2>Create Account</h2>
      <div className='auth-divider' />
      <p className='auth-subtitle'>New here? Join the conversation in seconds</p>

      {/* Username */}
      <label className='auth-label' htmlFor='reg-username'>Username</label>
      <input
        id='reg-username'
        type='text'
        placeholder='e.g. sourabh_123'
        value={username}
        className={`form-control${errors.username ? " is-invalid" : ""}`}
        onChange={(e) => { setUserName(e.target.value); setErrors((p) => ({ ...p, username: "" })); }}
        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
        disabled={loading}
      />
      {errors.username && <span className='auth-field-error'>{errors.username}</span>}

      {/* Password */}
      <label className='auth-label' htmlFor='reg-password'>Password</label>
      <input
        id='reg-password'
        type='password'
        placeholder='At least 6 characters'
        value={password}
        className={`form-control${errors.password ? " is-invalid" : ""}`}
        onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
        disabled={loading}
      />
      {errors.password && <span className='auth-field-error'>{errors.password}</span>}

      <div className='auth-spacer' />

      <button onClick={handleRegister} className='auth-btn' disabled={loading}>
        {loading ? "Creating…" : "Create Account"}
      </button>

      {apiMsg && (
        <p className={`auth-status${apiOk ? " success" : ""}`}>{apiMsg}</p>
      )}
    </div>
  );
};

export { Register };
