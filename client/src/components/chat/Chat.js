/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react";
import "./chat.css"
const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  console.log(users);
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("http://localhost:5001/users", {
          params: { currentUser: user.username },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    })();
  }, []);
  return (
    <div className='chat-container'>
      <h2>Welcome, {user?.username}</h2>
      <div className='chat-list'>
        <h3>Chats</h3>
        {users.map((u) => (
          <div key={u._id} className={`chat-user`}>
            {u.username}
          </div>
        ))}
      </div>

    </div>
  );
};
export { Chat };
