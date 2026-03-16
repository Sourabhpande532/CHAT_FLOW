/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./chat.css";
import { MessageList } from "../MessageList";
import API from "../../api/axiosInstance";
const socket = io("https://chat-flow-e7zr.onrender.com");

const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  // WITH WHOM YOU"R CHATTING
  const [currentChat, setCurrentChat] = useState(null);
  // SENDER & RECEIVER COLLECTION MSGs
  const [message, setMessage] = useState([]);
  // USER INTERACTION MSG TYPES
  const [currentMessage, setCurrentMessage] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/users", {
          params: { currentUser: user.username },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    })();
    // Listen for incoming message
    socket.on("receive_message", (data) => {
      if (data.sender === currentChat || data.receiver === currentChat) {
        setMessage((prev) => [...prev, data]);
      }
    });
    return () => {
      socket.off("receive_message");
    };
  }, [currentChat]);

  const fetchMessages = async (receiver) => {
    try {
      const { data } = await API.get("/messages", {
        params: { sender: user.username, receiver },
      });
      setMessage(data);
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Error fetching message", error);
    }
  };

  const sendMessage = () => {
    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };
    socket.emit("send_message", messageData);
    setMessage((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };

  return (
    <div className='chat-container'>
      <h2>Welcome, {user?.username}</h2>
      <div className='chat-list'>
        <h3>Chats</h3>
        {users.map((u) => (
          <div
            key={u._id}
            className={`chat-user ${currentChat === u.username ? "active" : ""}`}
            onClick={() => fetchMessages(u.username)}>
            {u.username}
          </div>
        ))}
      </div>
      {/* To Whom with chatting If User*/}
      {currentChat && (
        <div className='chat-window'>
          <h5>You are chatting with {currentChat}</h5>
          <MessageList messages={message} user={user} />
          <div className='message-field'>
            <input
              type='text'
              value={currentMessage}
              placeholder='Type a message...'
              style={{ minWidth: "400px" }}
              onChange={(e) => setCurrentMessage(e.target.value)}
            />
            <button className='btn-prime' onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export { Chat };
