const Sidebar = ({ users, currentChat, fetchMessages, avatarLetter, user }) => {
  return (
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
  );
};
export default Sidebar;
