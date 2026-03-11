import { useState } from "react";
import "./App.css";
import { Chat } from "./components/Chat";
import { Register } from "./components/Register";
import { Login } from "./components/Login";

function App() {
  const [user, setUser] = useState(null);
  return (
    <div className='app'>
      <h1>Chat app</h1>
      {!user ? (
        <div className='container mt-5 text-center'>
          <div className='row'>
            <div className='col-md-6'>
              <Register setUser={setUser} />
            </div>
            <div className='col-md-6'>
              <Login setUser={setUser} />
            </div>
          </div>
        </div>
      ) : (
        <Chat />
      )}
    </div>
  );
}

export default App;
