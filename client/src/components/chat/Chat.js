import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import "./chat.css";
import { MessageList } from "../MessageList";
import Sidebar, { LogoutIcon } from "../Sidebar";
import API, { BASE_URL } from "../../api/axiosInstance";
import { CONTACTS_CACHE_KEY } from "../../App";
import EmojiPicker from "emoji-picker-react";

const loadCachedContacts = (currentUsername) => {
  try {
    const raw = localStorage.getItem(CONTACTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((u) => u && u.username && u.username !== currentUsername);
  } catch {
    return null;
  }
};

const formatShortTime = (dateValue) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Chat = ({ user, setUser, onLogout, onNavigateHome }) => {
  const initialContacts = useMemo(
    () => loadCachedContacts(user?.username),
    [user?.username],
  );

  const [users, setUsers] = useState(() => initialContacts || []);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(
    () => !initialContacts || initialContacts.length === 0,
  );
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [isConnected, setIsConnected] = useState(true);

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const messageInputRef = useRef(null);

  // B3 fix: socket in a ref — created once, never re-created on re-render
  const socketRef = useRef(null);
  if (!socketRef.current) {
    socketRef.current = io(BASE_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  const socket = socketRef.current;

  // B5 fix: hold the typing timeout in a ref so we can clear it
  const typingTimerRef = useRef(null);

  // Disconnect socket cleanly when Chat component unmounts
  useEffect(() => {
    const activeSocket = socketRef.current;
    if (!activeSocket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    activeSocket.on("connect", handleConnect);
    activeSocket.on("disconnect", handleDisconnect);

    return () => {
      activeSocket.off("connect", handleConnect);
      activeSocket.off("disconnect", handleDisconnect);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      activeSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

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

  // Fetch contacts once per logged-in user (stale-while-revalidate with cache)
  useEffect(() => {
    let isMounted = true;
    const cached = loadCachedContacts(user?.username);
    if (cached && cached.length > 0) {
      setUsers(cached);
      setLoadingUsers(false);
    } else {
      setLoadingUsers(true);
    }

    const fetchUsers = async () => {
      try {
        const res = await API.get("/users", {
          params: { currentUser: user.username },
        });
        if (isMounted && Array.isArray(res.data)) {
          setUsers(res.data);
          try {
            localStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(res.data));
          } catch {
            /* ignore storage errors */
          }
        }
      } catch (err) {
        /* preserve cached contacts on transient network error */
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

  // Real-time socket listeners scoped to currentChat and current user
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (data) => {
      if (!data || !data.sender || !data.receiver) return;

      const enrichedMessage = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        read: Boolean(data.read),
      };

      const isForCurrentUser =
        data.receiver === user.username || data.sender === user.username;
      if (!isForCurrentUser) return;

      const peer =
        data.sender === user.username ? data.receiver : data.sender;

      setLastMessages((prev) => ({
        ...prev,
        [peer]: {
          text: data.message,
          time: formatShortTime(enrichedMessage.createdAt),
          sender: data.sender,
        },
      }));

      const isActiveConversation =
        (data.sender === currentChat && data.receiver === user.username) ||
        (data.sender === user.username && data.receiver === currentChat);

      if (isActiveConversation) {
        setMessage((prev) => [...prev, enrichedMessage]);
        if (data.sender === currentChat) {
          setTypingUser(null);
          socket.emit("mark_read", {
            sender: currentChat,
            receiver: user.username,
          });
        }
      } else if (data.receiver === user.username) {
        setUnreadCounts((prev) => ({
          ...prev,
          [data.sender]: (prev[data.sender] || 0) + 1,
        }));
        toast(`New message from ${data.sender}`, {
          icon: "💬",
          id: `msg-${data.sender}`,
          duration: 2800,
        });
      }
    });

    socket.on("user_typing", ({ sender, receiver } = {}) => {
      if (
        sender === currentChat &&
        (!receiver || receiver === user.username)
      ) {
        setTypingUser(sender);
      }
    });

    socket.on("user_stop_typing", ({ sender, receiver } = {}) => {
      if (
        !sender ||
        (sender === currentChat && (!receiver || receiver === user.username))
      ) {
        setTypingUser(null);
      }
    });

    socket.on("messages_read", ({ sender, receiver } = {}) => {
      if (
        sender === user.username &&
        (!receiver || receiver === currentChat)
      ) {
        setMessage((prev) =>
          prev.map((msg) =>
            msg.sender === sender ? { ...msg, read: true } : msg,
          ),
        );
      }
    });

    // B2 fix: clean up ALL listeners including messages_read
    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("messages_read");
    };
  }, [currentChat, user.username, socket]);

  const fetchMessages = useCallback(
    async (receiver) => {
      if (!receiver) return;
      setCurrentChat(receiver);
      setTypingUser(null);
      setShowEmoji(false);
      setUnreadCounts((prev) => {
        if (!prev[receiver]) return prev;
        const next = { ...prev };
        delete next[receiver];
        return next;
      });
      setLoadingMessages(true);
      try {
        const { data } = await API.get("/messages", {
          params: { sender: user.username, receiver },
        });
        const list = Array.isArray(data) ? data : [];
        setMessage(list);
        if (list.length > 0) {
          const latest = list[list.length - 1];
          setLastMessages((prev) => ({
            ...prev,
            [receiver]: {
              text: latest.message,
              time: formatShortTime(latest.createdAt),
              sender: latest.sender,
            },
          }));
        }
        socket?.emit("mark_read", {
          sender: receiver,
          receiver: user.username,
        });
      } catch (err) {
        toast.error("Unable to load messages. Please try again.");
      } finally {
        setLoadingMessages(false);
      }
    },
    [user.username, socket],
  );

  const sendMessage = useCallback(() => {
    const trimmed = currentMessage.trim();
    if (!trimmed || !currentChat) return;

    const nowIso = new Date().toISOString();
    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: trimmed,
      createdAt: nowIso,
      read: false,
    };

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    socket?.emit("stop_typing", {
      sender: user.username,
      receiver: currentChat,
    });

    socket?.emit("send_message", messageData);
    setMessage((prev) => [...prev, messageData]);
    setLastMessages((prev) => ({
      ...prev,
      [currentChat]: {
        text: trimmed,
        time: formatShortTime(nowIso),
        sender: user.username,
      },
    }));
    setCurrentMessage("");
    setShowEmoji(false);
  }, [currentMessage, currentChat, user.username, socket]);

  const handleTyping = useCallback(
    (e) => {
      const val = e.target.value;
      setCurrentMessage(val);

      if (!currentChat || !socket) return;

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

  const handleResetChat = useCallback(() => {
    setCurrentChat(null);
    setTypingUser(null);
    setShowEmoji(false);
    setSearchQuery("");
    if (typeof onNavigateHome === "function") {
      onNavigateHome();
    }
  }, [onNavigateHome]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.username?.toLowerCase().includes(q));
  }, [users, searchQuery]);

  /* Helper: avatar initial */
  const avatarLetter = useCallback(
    (name) => (name ? name.charAt(0).toUpperCase() : "?"),
    [],
  );

  /* Single Logout — clears session, disconnects socket, resets state */
  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("chatflow_user");
    } catch {
      /* ignore storage errors */
    }
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
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
  }, [onLogout, setUser]);

  return (
    <div
      className={`chat-container ${
        currentChat ? "has-active-chat" : "no-active-chat"
      }`}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        users={filteredUsers}
        totalUsersCount={users.length}
        loadingUsers={loadingUsers}
        currentChat={currentChat}
        fetchMessages={fetchMessages}
        onResetChat={handleResetChat}
        avatarLetter={avatarLetter}
        user={user}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadCounts={unreadCounts}
        lastMessages={lastMessages}
        isConnected={isConnected}
      />

      {/* ── Main chat area ── */}
      {currentChat ? (
        <main className='chat-window'>
          {/* Header */}
          <header className='chat-window-header'>
            <button
              type='button'
              className='btn-back-contacts'
              onClick={() => setCurrentChat(null)}
              title='Back to Contacts'
              aria-label='Back to Contacts'
            >
              ← Back
            </button>
            <div className='peer-avatar'>{avatarLetter(currentChat)}</div>
            <div className='peer-info'>
              <h5>{currentChat}</h5>
              <p className='status-text'>
                {typingUser === currentChat ? "Typing a message…" : "● Online"}
              </p>
            </div>
            <button
              type='button'
              className='btn-logout btn-logout-chat-mobile'
              onClick={handleLogout}
              title='Log out'
              aria-label='Log out'
            >
              <LogoutIcon />
              <span className='btn-logout-label'>Logout</span>
            </button>
          </header>

          {/* Messages Container */}
          <div className='chat-messages-container'>
            {loadingMessages ? (
              <div className='messages-loading'>
                <span className='contacts-spinner' /> Loading conversation…
              </div>
            ) : (
              <MessageList
                messages={message}
                user={user}
                currentChat={currentChat}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {typingUser && (
            <p className='typing' aria-live='polite'>
              <span className='typing-dots' aria-hidden='true'>
                <span />
                <span />
                <span />
              </span>
              {typingUser} is typing…
            </p>
          )}

          {/* Input — permanently sticky at bottom */}
          <div className='message-field'>
            <div className='emoji-picker-container' ref={emojiPickerRef}>
              <button
                ref={emojiButtonRef}
                type='button'
                className='btn-emoji'
                onClick={() => setShowEmoji((prev) => !prev)}
                title='Insert Emoji'
                aria-label='Insert Emoji'
                aria-expanded={showEmoji}
              >
                😊
              </button>

              {showEmoji && (
                <div className='emoji-picker-wrapper'>
                  <EmojiPicker
                    theme='dark'
                    width='100%'
                    height={360}
                    lazyLoadEmojis={true}
                    onEmojiClick={(emoji) => {
                      setCurrentMessage((prev) => prev + emoji.emoji);
                      messageInputRef.current?.focus();
                    }}
                  />
                </div>
              )}
            </div>

            <input
              ref={messageInputRef}
              type='text'
              value={currentMessage}
              placeholder={`Message ${currentChat}…`}
              aria-label={`Message ${currentChat}`}
              onChange={handleTyping}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              type='button'
              className='btn-send'
              onClick={sendMessage}
              disabled={!currentMessage.trim()}
              title='Send message'
              aria-label='Send message'
            >
              ➤
            </button>
          </div>
        </main>
      ) : (
        <main className='chat-empty-state'>
          <div className='empty-state-card'>
            <div className='empty-status-pill'>
              <span className='online-badge' />
              Signed in as <strong>{user?.username}</strong>
            </div>
            <div className='empty-icon'>💬</div>
            <h4>Welcome to ChatFlow</h4>
            <p>
              Select a contact from the sidebar to start a real-time conversation.
            </p>
            <div className='empty-feature-pills'>
              <span>⚡ Instant Delivery</span>
              <span>✔✔ Read Receipts</span>
              <span>✍️ Live Typing</span>
              <span>😊 Emoji Picker</span>
            </div>

            {users.length > 0 && (
              <div className='empty-quick-contacts'>
                <span className='empty-quick-label'>Quick Start Chat</span>
                <div className='empty-quick-list'>
                  {users.slice(0, 4).map((u) => (
                    <button
                      key={u._id || u.username}
                      type='button'
                      className='empty-quick-btn'
                      onClick={() => fetchMessages(u.username)}
                    >
                      <span className='empty-quick-avatar'>
                        {avatarLetter(u.username)}
                      </span>
                      <span>{u.username}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export { Chat };
