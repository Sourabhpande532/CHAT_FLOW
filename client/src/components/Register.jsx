import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../api/axiosInstance";

const EyeIcon = ({ visible }) =>
  visible ? (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94' />
      <path d='M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19' />
      <line x1='1' y1='1' x2='23' y2='23' />
    </svg>
  ) : (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
      <circle cx='12' cy='12' r='3' />
    </svg>
  );

const Register = ({ setUser }) => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiMsg, setApiMsg] = useState(null);
  const [apiOk, setApiOk] = useState(false);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const validate = () => {
    const e = {};
    const clean = username.trim();
    if (!clean) e.username = "Username is required";
    else if (clean.length < 3) e.username = "At least 3 characters required";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters required";
    return e;
  };

  const handleRegister = async (evt) => {
    if (evt && evt.preventDefault) evt.preventDefault();
    if (loading) return;

    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setErrors({});
    setApiMsg(null);
    setLoading(true);

    try {
      const cleanUsername = username.trim();
      const { data } = await API.post(`/auth/register`, {
        username: cleanUsername,
        password,
      });
      toast.success("Account created successfully! Welcome 🎉");
      if (isMountedRef.current) {
        setApiOk(true);
        setApiMsg("Account created successfully! Redirecting…");
      }
      setUser(data);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Unable to register user. Please try again.";
      if (isMountedRef.current) {
        setApiOk(false);
        setApiMsg(msg);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (isMountedRef.current) setApiMsg(null);
        }, 4000);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <form className='auth-card-register' onSubmit={handleRegister} noValidate>
      <div className='auth-card-badge primary'>Get Started</div>
      <h2>Create Account</h2>
      <div className='auth-divider' />
      <p className='auth-subtitle'>
        New here? Join the conversation in seconds
      </p>

      <label className='auth-label' htmlFor='reg-username'>
        Username
      </label>
      <input
        id='reg-username'
        type='text'
        placeholder='e.g. sourabh_123'
        value={username}
        autoComplete='username'
        className={`form-control${errors.username ? " is-invalid" : ""}`}
        onChange={(e) => {
          setUserName(e.target.value);
          if (errors.username) setErrors((p) => ({ ...p, username: "" }));
          if (apiMsg) setApiMsg(null);
        }}
        disabled={loading}
      />
      {errors.username && (
        <span className='auth-field-error' role='alert'>
          {errors.username}
        </span>
      )}

      <label className='auth-label' htmlFor='reg-password'>
        Password
      </label>
      <div className='password-input-wrapper'>
        <input
          id='reg-password'
          type={showPassword ? "text" : "password"}
          placeholder='At least 6 characters'
          value={password}
          autoComplete='new-password'
          className={`form-control${errors.password ? " is-invalid" : ""}`}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((p) => ({ ...p, password: "" }));
            if (apiMsg) setApiMsg(null);
          }}
          disabled={loading}
        />
        <button
          type='button'
          className='password-toggle-btn'
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          <EyeIcon visible={showPassword} />
        </button>
      </div>
      {errors.password && (
        <span className='auth-field-error' role='alert'>
          {errors.password}
        </span>
      )}

      <div className='auth-spacer' />

      <button type='submit' className='auth-btn' disabled={loading}>
        {loading ? "Creating…" : "Create Account"}
      </button>

      {apiMsg && (
        <p
          className={`auth-status${apiOk ? " success" : ""}`}
          role='alert'
        >
          {apiMsg}
        </p>
      )}
    </form>
  );
};

export { Register };
