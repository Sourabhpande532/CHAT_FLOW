import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./style.css";
import { Toaster } from "react-hot-toast";
import { Chat } from "./components/chat/Chat";
import { LandingPage } from "./components/LandingPage";
import API from "./api/axiosInstance";

const STORAGE_KEY = "chatflow_user";
export const CONTACTS_CACHE_KEY = "chatflow_contacts_cache";

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
  const [user, setUser] = useState(loadUser);
  const [showLanding, setShowLanding] = useState(false);

  // Warm up server + MongoDB connection pool and pre-cache contacts for instant load after login
  useEffect(() => {
    API.get("/").catch(() => {});
    API.get("/users")
      .then((res) => {
        if (Array.isArray(res.data)) {
          try {
            localStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(res.data));
          } catch {
            /* ignore storage errors */
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSetUser = (userData) => {
    saveUser(userData);
    setUser(userData);
    if (userData) {
      setShowLanding(false);
    }
  };

  const handleLogout = () => {
    setShowLanding(false);
    handleSetUser(null);
  };

  return (
    <div className='app'>
      <Toaster
        position='top-center'
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#1A1814",
            color: "#F5F2ED",
            border: "1px solid rgba(200, 180, 150, 0.22)",
            fontSize: "0.875rem",
          },
        }}
      />

      {!user || showLanding ? (
        <LandingPage
          setUser={handleSetUser}
          currentUser={user}
          onContinueToChat={() => setShowLanding(false)}
        />
      ) : (
        <Chat
          user={user}
          setUser={handleSetUser}
          onLogout={handleLogout}
          onNavigateHome={() => setShowLanding(true)}
        />
      )}
    </div>
  );
}

export default App;
