import { useState } from "react";
import "./App.css";
import "./style.css";
import { Toaster } from "react-hot-toast";
import { Chat } from "./components/chat/Chat";
import { Register } from "./components/Register";
import { Login } from "./components/Login";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css"

function App() {
  const [user, setUser] = useState(null);
  return (
    <div className='app'>
      <Toaster position='top-center' reverseOrder={false} />
      {!user ? (
        <div className='auth-page-wrapper'>
          <div className='container'>
            <div className='app-brand mb-4'>
              <span>💬 ChatFlow</span>
              <p>Connect and chat in real-time</p>
            </div>
            <div className='row justify-content-center'>
              <div className='col-md-6 mb-4 mb-md-0'>
                <Register setUser={setUser} />
              </div>
              <div className='col-md-6'>
                <Login setUser={setUser} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Chat user={user} />
      )}
    </div>
  );
}

export default App;
