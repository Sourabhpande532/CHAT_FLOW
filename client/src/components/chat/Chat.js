/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import "./chat.css";
import { MessageList } from "../MessageList";
import API from "../../api/axiosInstance";
import EmojiPicker from "emoji-picker-react";

const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  // B3 fix: socket in a ref — created once, never re-created on re-render
  const socketRef = useRef(null);
  if (!socketRef.current) {
    socketRef.current = io("https://chat-flow-e7zr.onrender.com");
  }
  const socket = socketRef.current;

  // B5 fix: hold the typing timeout in a ref so we can clear it
  const typingTimerRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await API.get("/users", {
        params: { currentUser: user.username },
      });
      setUsers(res.data);
    };

    fetchUsers();

    // Register socket listeners
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
          msg.sender === sender ? { ...msg, read: true } : msg
        )
      );
    });

    // B2 fix: clean up ALL listeners including messages_read
    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("messages_read");
    };
  }, [currentChat]);

  const fetchMessages = useCallback(async (receiver) => {
    const { data } = await API.get("/messages", {
      params: { sender: user.username, receiver },
    });
    setMessage(data);
    setCurrentChat(receiver);
    socket.emit("mark_read", {
      sender: receiver,
      receiver: user.username,
    });
  }, [user.username, socket]);

  const sendMessage = useCallback(() => {
    if (!currentMessage.trim()) return;

    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };

    socket.emit("send_message", messageData);
    setMessage((prev) => [...prev, messageData]);
    setCurrentMessage("");
  }, [currentMessage, currentChat, user.username, socket]);

  const handleTyping = useCallback((e) => {
    setCurrentMessage(e.target.value);

    socket.emit("typing", {
      sender: user.username,
      receiver: currentChat,
    });

    // B5 fix: clear previous timer before setting a new one
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        sender: user.username,
        receiver: currentChat,
      });
    }, 1000);
  }, [currentChat, user.username, socket]);

  /* Helper: avatar initial */
  const avatarLetter = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <div className="chat-container">

      {/* ── Sidebar ── */}
      <div className="chat-list">
        <div className="chat-list-header">
          <div className="app-title">
            <span className="online-badge" />
            💬 ChatFlow
          </div>
        </div>

        <h3>Contacts</h3>

        <div className="chat-users-scroll">
          {users.map((u) => (
            <div
              key={u._id}
              className={`chat-user ${currentChat === u.username ? "active" : ""}`}
              onClick={() => fetchMessages(u.username)}
            >
              <div className="chat-user-avatar">{avatarLetter(u.username)}</div>
              <span className="chat-user-name">{u.username}</span>
            </div>
          ))}
        </div>

        <div className="chat-current-user">
          <div className="you-avatar">{avatarLetter(user?.username)}</div>
          <span>{user?.username}</span>
        </div>
      </div>

      {/* ── Main area ── */}
      {currentChat ? (
        <div className="chat-window">

          {/* Header */}
          <div className="chat-window-header">
            <div className="peer-avatar">{avatarLetter(currentChat)}</div>
            <div>
              <h5>{currentChat}</h5>
              <p className="status-text">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <MessageList messages={message} user={user} />

          {typingUser && (
            <p className="typing">{typingUser} is typing…</p>
          )}

          {/* Input */}
          <div className="message-field">
            <button
              className="btn-emoji"
              onClick={() => setShowEmoji(!showEmoji)}
            >
              😊
            </button>

            {showEmoji && (
              <div className="emoji-picker-wrapper">
                <EmojiPicker
                  onEmojiClick={(emoji) =>
                    setCurrentMessage((prev) => prev + emoji.emoji)
                  }
                />
              </div>
            )}

            <input
              type="text"
              value={currentMessage}
              placeholder="Type a message…"
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button className="btn-send" onClick={sendMessage}>
              ➤
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-empty-state">
          <div className="empty-icon">💬</div>
          <p>Select a contact to start chatting</p>
        </div>
      )}
    </div>
  );
};

export { Chat };
