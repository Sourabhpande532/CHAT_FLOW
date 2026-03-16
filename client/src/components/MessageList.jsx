const MessageList = ({ messages, user }) => {
  return (
    <div className='message-list'>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${
            msg.sender === user.username ? "sent" : "received"
          }`}>
          <strong>{msg.sender}: </strong>
          {msg.message}
          <div className='meta'>
            <span>
              {msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString()
                : ""}
            </span>
            {msg.sender === user.username && (
              <span>{msg.read ? "✔✔" : "✔"}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
export { MessageList };
