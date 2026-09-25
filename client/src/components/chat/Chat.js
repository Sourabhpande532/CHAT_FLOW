/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import "./chat.css";
import { MessageList } from "../MessageList";
import API from "../../api/axiosInstance";
import EmojiPicker from "emoji-picker-react";

const Chat = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
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

  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  useEffect(() => {
    if (!showEmoji) return;

    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showEmoji]);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await API.get("/users", {
          params: { currentUser: user.username },
        });
        if (isMounted) {
          setUsers(res.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [user.username]);

  const handleLogout = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (onLogout) {
      onLogout();
    }
  }, [onLogout]);

  useEffect(() => {
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
          {onLogout && (
            <button
              className="btn-logout btn-logout-mobile"
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          )}
        </div>

        <h3>Contacts</h3>

        <div className="chat-users-scroll">
          {loadingUsers ? (
            <div className="contacts-loading">
              <div className="contacts-spinner" />
              <span>Loading contacts…</span>
            </div>
          ) : users.length === 0 ? (
            <div className="contacts-empty">No contacts available</div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className={`chat-user ${currentChat === u.username ? "active" : ""}`}
                onClick={() => fetchMessages(u.username)}
              >
                <div className="chat-user-avatar">{avatarLetter(u.username)}</div>
                <span className="chat-user-name">{u.username}</span>
              </div>
            ))
          )}
        </div>

        <div className="chat-current-user">
          <div className="chat-current-user-info">
            <div className="you-avatar">{avatarLetter(user?.username)}</div>
            <span className="chat-current-user-name">{user?.username}</span>
          </div>
          {onLogout && (
            <button
              className="btn-logout"
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          )}
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
              ref={emojiButtonRef}
              className="btn-emoji"
              onClick={() => setShowEmoji((prev) => !prev)}
            >
              😊
            </button>

            {showEmoji && (
              <div ref={emojiPickerRef} className="emoji-picker-wrapper">
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
