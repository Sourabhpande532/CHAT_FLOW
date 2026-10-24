import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";
import "./style.css";
import { Toaster } from "react-hot-toast";
import { Chat } from "./components/chat/Chat";
import { Register } from "./components/Register";
import { Login } from "./components/Login";
import API from "./api/axiosInstance";

/* ── helpers ── */
const STORAGE_KEY = "chatflow_user";

const loadUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveUser = (userData) => {
  try {
    if (userData) localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore storage errors */
  }
};

function App() {
  // Initialise from localStorage so refresh keeps the session alive
  const [user, setUser] = useState(loadUser);

  // Background wake-up ping to prevent Render free tier cold-start delay
  useEffect(() => {
    API.get("/").catch(() => {});
  }, []);

  // Wrap setter so every login/register also persists to localStorage
  const handleSetUser = (userData) => {
    saveUser(userData);
    setUser(userData);
  };

  return (
    <div className='app'>
      <Toaster position='top-center' reverseOrder={false} />

      {!user ? (
        <div className='auth-page-wrapper'>
          <div className='container'>
            {/* Brand */}
            <div
              className='app-brand'
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              title='ChatFlow'
            >
              <span>
                💬 Chat<em>Flow</em>
              </span>
              <p>Real-time messaging, built simple.</p>
            </div>

            <div className='row justify-content-center g-3 align-items-stretch'>
              <div className='col-sm-10 col-md-5'>
                <Register setUser={handleSetUser} />
              </div>
              <div className='col-sm-10 col-md-5'>
                <Login setUser={handleSetUser} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Chat user={user} setUser={handleSetUser} />
      )}
    </div>
  );
}

export default App;
