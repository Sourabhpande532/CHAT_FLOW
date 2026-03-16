/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./chat.css";
import { MessageList } from "../MessageList";
import API from "../../api/axiosInstance";
import EmojiPicker from "emoji-picker-react";

const socket = io("https://chat-flow-e7zr.onrender.com");

const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  // WITH WHOM YOU"R CHATTING
  const [currentChat, setCurrentChat] = useState(null);
  // SENDER & RECEIVER COLLECTION MSGs
  const [message, setMessage] = useState([]);
  // USER INTERACTION MSG TYPES
  const [currentMessage, setCurrentMessage] = useState("");
  // TYPING SUGGESTION
  const [typingUser, setTypingUser] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

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

    socket.on("user_typing", ({ sender }) => {
      if (sender === currentChat) {
        setTypingUser(sender);
      }
    });

    socket.on("user_stop_typing", () => {
      setTypingUser(null);
    });
    socket.on("messages_read", ({ sender }) => {
      setMessage((prev) =>
        prev.map((msg) =>
          msg.sender === sender ? { ...msg, read: true } : msg,
        ),
      );
    });
    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [currentChat]);

  const fetchMessages = async (receiver) => {
    try {
      const { data } = await API.get("/messages", {
        params: { sender: user.username, receiver },
      });
      setMessage(data);
      setCurrentChat(receiver);

      socket.emit("mark_read", {
        sender: receiver,
        receiver: user.username,
      });
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
          {typingUser && <p className='typing'>{typingUser} is typing</p>}
          <div className='message-field'>
            <div className='emoji-container'>
              <button
                className='emoji-btn'
                onClick={() => setShowEmoji(!showEmoji)}>
                😊
              </button>

              {showEmoji && (
                <div className='emoji-picker'>
                  <EmojiPicker
                    onEmojiClick={(emoji) =>
                      setCurrentMessage((prev) => prev + emoji.emoji)
                    }
                  />
                </div>
              )}
            </div>
            <input
              type='text'
              value={currentMessage}
              placeholder='Type a message...'
              onChange={(e) => {
                setCurrentMessage(e.target.value);

                socket.emit("typing", {
                  sender: user.username,
                  receiver: currentChat,
                });

                setTimeout(() => {
                  socket.emit("stop_typing", {
                    sender: user.username,
                    receiver: currentChat,
                  });
                }, 1000);
              }}
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
