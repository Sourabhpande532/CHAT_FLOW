/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import "./chat.css";
import { MessageList } from "../MessageList";
import API from "../../api/axiosInstance";
import EmojiPicker from "emoji-picker-react";

/* Universal Vector SVG Logout Icon — crisp on all devices, never renders as a cross/box */
const LogoutIcon = () => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.2'
    strokeLinecap='round'
    strokeLinejoin='round'
    style={{ display: "block" }}
    aria-hidden='true'
  >
    <path d='M18.36 6.64a9 9 0 1 1-12.73 0' />
    <line x1='12' y1='2' x2='12' y2='12' />
  </svg>
);

const Chat = ({ user, setUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // B3 fix: socket in a ref — created once, never re-created on re-render
  const socketRef = useRef(null);
  if (!socketRef.current) {
    socketRef.current = io("https://chat-flow-e7zr.onrender.com");
  }
  const socket = socketRef.current;

  // B5 fix: hold the typing timeout in a ref so we can clear it
  const typingTimerRef = useRef(null);

  // Close emoji picker when clicking anywhere outside or pressing Escape
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

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

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
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    };

    fetchUsers();

    // Register socket listeners
    socket.on("receive_message", (data) => {
      if (data.sender === currentChat || data.receiver === currentChat) {
        setMessage((prev) => [...prev, data]);
        // If message is from current chat, mark as read
        if (data.sender === currentChat) {
          socket.emit("mark_read", {
            sender: currentChat,
            receiver: user.username,
          });
        }
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

    // B2 fix: clean up ALL listeners including messages_read
    return () => {
      isMounted = false;
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("messages_read");
    };
  }, [currentChat]);

  const fetchMessages = useCallback(
    async (receiver) => {
      setCurrentChat(receiver);
      setLoadingMessages(true);
      try {
        const { data } = await API.get("/messages", {
          params: { sender: user.username, receiver },
        });
        setMessage(data);
        socket.emit("mark_read", {
          sender: receiver,
          receiver: user.username,
        });
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [user.username, socket],
  );

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
    setShowEmoji(false);
  }, [currentMessage, currentChat, user.username, socket]);

  const handleTyping = useCallback(
    (e) => {
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
    },
    [currentChat, user.username, socket],
  );

  /* Helper: avatar initial */
  const avatarLetter = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  /* Single Logout — clears session, disconnects socket, resets state */
  const handleLogout = () => {
    try {
      localStorage.removeItem("chatflow_user");
    } catch {
      /* ignore storage errors */
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (typeof onLogout === "function") {
      onLogout();
    }
    if (typeof setUser === "function") {
      setUser(null);
    }
  };

  return (
    <div
      className={`chat-container ${
        currentChat ? "has-active-chat" : "no-active-chat"
      }`}
    >
      {/* ── Sidebar ── */}
      <div className='chat-list'>
        {/* Top Header with ChatFlow and mobile logout SVG icon beside it */}
        <div className='chat-list-header'>
          <div
            className='app-title'
            onClick={() => setCurrentChat(null)}
            role='button'
            tabIndex={0}
            title='ChatFlow Home / Reset Chat'
            style={{ cursor: "pointer" }}
          >
            <span className='online-badge' />
            💬 ChatFlow
          </div>
          {/* Mobile logout icon (beside ChatFlow) */}
          <button
            className='btn-logout btn-logout-mobile'
            onClick={handleLogout}
            title='Logout'
            aria-label='Logout'
          >
            <LogoutIcon />
          </button>
        </div>

        <h3>Contacts</h3>

        <div className='chat-users-scroll'>
          {loadingUsers ? (
            <div className='contacts-status'>
              <span className='contacts-spinner' /> Loading contacts…
            </div>
          ) : users.length === 0 ? (
            <div className='contacts-status'>No other contacts available</div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className={`chat-user ${
                  currentChat === u.username ? "active" : ""
                }`}
                onClick={() => fetchMessages(u.username)}
              >
                <div className='chat-user-avatar'>{avatarLetter(u.username)}</div>
                <div className='chat-user-details'>
                  <span className='chat-user-name'>{u.username}</span>
                  <span className='chat-user-sub'>Click to chat</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop profile row at bottom of sidebar — logout icon beside user name */}
        <div className='chat-current-user'>
          <div className='you-avatar'>{avatarLetter(user?.username)}</div>
          <div className='you-details'>
            <span className='you-name'>{user?.username}</span>
            <span className='you-status'>Active now</span>
          </div>
          <button
            className='btn-logout btn-logout-desktop'
            onClick={handleLogout}
            title='Logout'
            aria-label='Logout'
          >
            <LogoutIcon />
          </button>
        </div>
      </div>

      {/* ── Main chat area ── */}
      {currentChat ? (
        <div className='chat-window'>
          {/* Header */}
          <div className='chat-window-header'>
            <button
              className='btn-back-contacts'
              onClick={() => setCurrentChat(null)}
              title='Back to Contacts'
            >
              ← Back
            </button>
            <div className='peer-avatar'>{avatarLetter(currentChat)}</div>
            <div className='peer-info'>
              <h5>{currentChat}</h5>
              <p className='status-text'>● Online</p>
            </div>
          </div>

          {/* Messages Container — permanently anchored, never white */}
          <div className='chat-messages-container'>
            {loadingMessages ? (
              <div className='messages-loading'>
                <span className='contacts-spinner' /> Loading conversation…
              </div>
            ) : (
              <MessageList messages={message} user={user} />
            )}
            <div ref={messagesEndRef} />
          </div>

          {typingUser && <p className='typing'>{typingUser} is typing…</p>}

          {/* Input — permanently sticky at bottom */}
          <div className='message-field'>
            <div className='emoji-picker-container' ref={emojiPickerRef}>
              <button
                ref={emojiButtonRef}
                type='button'
                className='btn-emoji'
                onClick={() => setShowEmoji((prev) => !prev)}
                title='Insert Emoji'
              >
                😊
              </button>

              {showEmoji && (
                <div className='emoji-picker-wrapper'>
                  <EmojiPicker
                    onEmojiClick={(emoji) => {
                      setCurrentMessage((prev) => prev + emoji.emoji);
                    }}
                  />
                </div>
              )}
            </div>

            <input
              type='text'
              value={currentMessage}
              placeholder='Type a message…'
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              className='btn-send'
              onClick={sendMessage}
              title='Send message'
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        <div className='chat-empty-state'>
          <div className='empty-icon'>💬</div>
          <h4>Welcome to ChatFlow</h4>
          <p>Select a contact from the list to start messaging</p>
        </div>
      )}
    </div>
  );
};

export { Chat };
