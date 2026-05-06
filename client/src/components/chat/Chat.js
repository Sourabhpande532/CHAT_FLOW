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
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const [typingUser, setTypingUser] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await API.get("/users", {
        params: { currentUser: user.username },
      });
      setUsers(res.data);
    };

    fetchUsers();

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
    const { data } = await API.get("/messages", {
      params: { sender: user.username, receiver },
    });

    setMessage(data);
    setCurrentChat(receiver);

    socket.emit("mark_read", {
      sender: receiver,
      receiver: user.username,
    });
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };

    socket.emit("send_message", messageData);

    setMessage((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };

  /* helper: first letter avatar */
  const avatarLetter = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <div className='chat-container'>
      {/* ── Sidebar ── */}
      <div className='chat-list'>
        <div className='chat-list-header'>
          <div className='app-title'>
            <span className='online-badge' />
            💬 ChatFlow
          </div>
        </div>

        <h3>Contacts</h3>

        <div className='chat-users-scroll'>
          {users.map((u) => (
            <div
              key={u._id}
              className={`chat-user ${currentChat === u.username ? "active" : ""}`}
              onClick={() => fetchMessages(u.username)}>
              <div className='chat-user-avatar'>{avatarLetter(u.username)}</div>
              <span className='chat-user-name'>{u.username}</span>
            </div>
          ))}
        </div>

        <div className='chat-current-user'>
          <div className='you-avatar'>{avatarLetter(user?.username)}</div>
          <span>{user?.username}</span>
        </div>
      </div>

      {/* ── Main area ── */}
      {currentChat ? (
        <div className='chat-window'>
          {/* Header */}
          <div className='chat-window-header'>
            <div className='peer-avatar'>{avatarLetter(currentChat)}</div>
            <div>
              <h5>{currentChat}</h5>
              <p className='status-text'>● Online</p>
            </div>
          </div>

          {/* Messages */}
          <MessageList messages={message} user={user} />

          {typingUser && <p className='typing'>{typingUser} is typing…</p>}

          {/* Input */}
          <div className='message-field'>
            <button
              className='btn-emoji'
              onClick={() => setShowEmoji(!showEmoji)}>
              😊
            </button>

            {showEmoji && (
              <div className='emoji-picker-wrapper'>
                <EmojiPicker
                  onEmojiClick={(emoji) =>
                    setCurrentMessage((prev) => prev + emoji.emoji)
                  }
                />
              </div>
            )}

            <input
              type='text'
              value={currentMessage}
              placeholder='Type a message…'
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
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button className='btn-send' onClick={sendMessage}>
              ➤
            </button>
          </div>
        </div>
      ) : (
        <div className='chat-empty-state'>
          <div className='empty-icon'>💬</div>
          <p>Select a contact to start chatting</p>
        </div>
      )}
    </div>
  );
};

export { Chat };
