function ChatBox({
  message,
  setMessage,
  sendMessage,
  messages,
}) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">
        Chat
      </h2>

      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Type message..."
          className="border p-2 rounded w-80 text-black"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>

      <div className="mt-4">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>
              {msg.sender}:
            </strong>{" "}
            {msg.message}
          </p>
        ))}
      </div>
    </div>
  );
}

export default ChatBox;