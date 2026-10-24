const Sidebar = ({ users, loadingUsers, currentChat, fetchMessages, avatarLetter, user, onLogout }) => {
  return (
    <div className='chat-list'>
      <div className='chat-list-header'>
        <div className='app-title'>
          <span className='online-badge' />
          💬 ChatFlow
        </div>
        {onLogout && (
          <button
            className='btn-logout btn-logout-mobile'
            onClick={onLogout}
            title='Log out'
            aria-label='Log out'>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
              <polyline points='16 17 21 12 16 7' />
              <line x1='21' y1='12' x2='9' y2='12' />
            </svg>
            <span>Logout</span>
          </button>
        )}
      </div>

      <h3>Contacts</h3>

      <div className='chat-users-scroll'>
        {loadingUsers ? (
          <div className='contacts-loading'>
            <div className='contacts-spinner' />
            <span>Loading contacts…</span>
          </div>
        ) : users?.length === 0 ? (
          <div className='contacts-empty'>No contacts available</div>
        ) : (
          users?.map((u) => (
            <div
              key={u._id}
              className={`chat-user ${currentChat === u.username ? "active" : ""}`}
              onClick={() => fetchMessages(u.username)}>
              <div className='chat-user-avatar'>{avatarLetter(u.username)}</div>
              <span className='chat-user-name'>{u.username}</span>
            </div>
          ))
        )}
      </div>
      <div className='chat-current-user'>
        <div className='chat-current-user-info'>
          <div className='you-avatar'>{avatarLetter(user?.username)}</div>
          <span className='chat-current-user-name'>{user?.username}</span>
        </div>
        {onLogout && (
          <button
            className='btn-logout'
            onClick={onLogout}
            title='Log out'
            aria-label='Log out'>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
              <polyline points='16 17 21 12 16 7' />
              <line x1='21' y1='12' x2='9' y2='12' />
            </svg>
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
