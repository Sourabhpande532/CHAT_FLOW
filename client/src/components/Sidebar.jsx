import { memo } from "react";

export const LogoutIcon = () => (
  <svg
    width='15'
    height='15'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.2'
    strokeLinecap='round'
    strokeLinejoin='round'
    style={{ display: "block" }}
    aria-hidden='true'
  >
    <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
    <polyline points='16 17 21 12 16 7' />
    <line x1='21' y1='12' x2='9' y2='12' />
  </svg>
);

const SearchIcon = () => (
  <svg
    width='14'
    height='14'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <circle cx='11' cy='11' r='8' />
    <line x1='21' y1='21' x2='16.65' y2='16.65' />
  </svg>
);

const Sidebar = memo(
  ({
    users,
    totalUsersCount = 0,
    loadingUsers,
    currentChat,
    fetchMessages,
    onResetChat,
    avatarLetter,
    user,
    onLogout,
    searchQuery = "",
    onSearchChange,
    unreadCounts = {},
    lastMessages = {},
    isConnected = true,
  }) => {
    const handleBrandKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (onResetChat) onResetChat();
      }
    };

    return (
      <aside className='chat-list' aria-label='Contacts sidebar'>
        {/* Top Header */}
        <div className='chat-list-header'>
          <div
            className='app-title'
            onClick={onResetChat}
            onKeyDown={handleBrandKeyDown}
            role='button'
            tabIndex={0}
            title='ChatFlow Home'
          >
            <span
              className={`online-badge ${isConnected ? "connected" : "reconnecting"}`}
              title={isConnected ? "Connected" : "Reconnecting"}
            />
            <span>
              💬 Chat<em>Flow</em>
            </span>
          </div>

          {onLogout && (
            <button
              type='button'
              className='btn-logout btn-logout-mobile'
              onClick={onLogout}
              title='Log out'
              aria-label='Log out'
            >
              <LogoutIcon />
              <span className='btn-logout-label'>Logout</span>
            </button>
          )}
        </div>

        {/* Contact Search Bar */}
        {onSearchChange && (
          <div className='sidebar-search-wrapper'>
            <div className='sidebar-search-box'>
              <span className='sidebar-search-icon'>
                <SearchIcon />
              </span>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder='Search contacts…'
                aria-label='Search contacts'
                className='sidebar-search-input'
              />
              {searchQuery && (
                <button
                  type='button'
                  className='sidebar-search-clear'
                  onClick={() => onSearchChange("")}
                  aria-label='Clear search'
                  title='Clear search'
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        <div className='contacts-section-header'>
          <h3>Contacts</h3>
          {!loadingUsers && totalUsersCount > 0 && (
            <span className='contacts-count-badge'>{users?.length || 0}</span>
          )}
        </div>

        <div className='chat-users-scroll'>
          {loadingUsers ? (
            <div className='contacts-status'>
              <span className='contacts-spinner' />
              <span>Loading contacts…</span>
            </div>
          ) : !users || users.length === 0 ? (
            <div className='contacts-status contacts-empty-box'>
              {searchQuery ? (
                <>
                  <span>No contacts match &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type='button'
                    className='btn-clear-filter'
                    onClick={() => onSearchChange && onSearchChange("")}
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <span>No other contacts available</span>
              )}
            </div>
          ) : (
            users.map((u) => {
              const isActive = currentChat === u.username;
              const unread = unreadCounts[u.username] || 0;
              const lastMsg = lastMessages[u.username];

              return (
                <div
                  key={u._id || u.username}
                  className={`chat-user ${isActive ? "active" : ""}`}
                  onClick={() => fetchMessages(u.username)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fetchMessages(u.username);
                    }
                  }}
                  role='button'
                  tabIndex={0}
                  aria-current={isActive ? "true" : undefined}
                >
                  <div className='chat-user-avatar'>
                    {avatarLetter(u.username)}
                  </div>
                  <div className='chat-user-details'>
                    <div className='chat-user-top-row'>
                      <span className='chat-user-name'>{u.username}</span>
                      {lastMsg?.time && (
                        <span className='chat-user-time'>{lastMsg.time}</span>
                      )}
                    </div>
                    <div className='chat-user-bottom-row'>
                      <span className='chat-user-sub'>
                        {lastMsg?.text
                          ? `${lastMsg.sender === user?.username ? "You: " : ""}${lastMsg.text}`
                          : "Click to chat"}
                      </span>
                      {unread > 0 && (
                        <span
                          className='unread-badge'
                          aria-label={`${unread} unread messages`}
                        >
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Logged-in user profile footer */}
        <div className='chat-current-user'>
          <div className='you-avatar'>{avatarLetter(user?.username)}</div>
          <div className='you-details'>
            <span className='you-name'>{user?.username}</span>
            <span className='you-status'>Active now</span>
          </div>
          {onLogout && (
            <button
              type='button'
              className='btn-logout btn-logout-desktop'
              onClick={onLogout}
              title='Log out'
              aria-label='Log out'
            >
              <LogoutIcon />
              <span className='btn-logout-label'>Logout</span>
            </button>
          )}
        </div>
      </aside>
    );
  },
);

export default Sidebar;
