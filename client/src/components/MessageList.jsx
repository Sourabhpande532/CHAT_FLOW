import { memo } from "react";

const formatMessageTime = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateLabel = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

const MessageList = memo(({ messages, user, currentChat }) => {
  if (!messages || messages.length === 0) {
    return (
      <div className='message-list message-list-empty'>
        <div className='conversation-empty-card'>
          <div className='conversation-empty-icon'>👋</div>
          <h6>
            {currentChat
              ? `No messages with ${currentChat} yet`
              : "No messages yet"}
          </h6>
          <p>
            Send a message below to start your real-time conversation.
          </p>
        </div>
      </div>
    );
  }

  let lastDateLabel = null;

  return (
    <div className='message-list'>
      {messages.map((msg, index) => {
        const isSent = msg.sender === user?.username;
        const dateLabel = formatDateLabel(msg.createdAt);
        const showDateDivider = dateLabel && dateLabel !== lastDateLabel;
        if (dateLabel) lastDateLabel = dateLabel;

        return (
          <div key={msg._id || `${msg.sender}-${msg.createdAt || index}-${index}`} className='message-row-group'>
            {showDateDivider && (
              <div className='message-date-divider'>
                <span>{dateLabel}</span>
              </div>
            )}
            <div className={`message ${isSent ? "sent" : "received"}`}>
              <strong>{msg.sender}</strong>
              <span className='message-body-text'>{msg.message}</span>

              <div className='meta'>
                <span className='message-time'>
                  {formatMessageTime(msg.createdAt)}
                </span>

                {isSent && (
                  <span
                    className={`read-receipt ${msg.read ? "is-read" : "is-unread"}`}
                    title={msg.read ? "Read" : "Sent"}
                  >
                    {msg.read ? "✔✔" : "✔"}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export { MessageList };
