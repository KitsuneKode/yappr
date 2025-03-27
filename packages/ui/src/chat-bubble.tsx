export function ChatBubble() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">User</span>
            <span className="text-xs text-gray-500">12:00 PM</span>
          </div>
          <div className="bg-blue-500 text-white p-2 rounded-lg max-w-xs">
            <p>This is a chat bubble with a user avatar and timestamp.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
          <img
            src="https://via.placeholder.com/40"
            alt="Bot Avatar"
            className="w-10 h-10 rounded-full"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Bot</span>
            <span className="text-xs text-gray-500">12:01 PM</span>
          </div>
          <div className="bg-gray-200 text-black p-2 rounded-lg max-w-xs">
            <p>This is a chat bubble with a bot avatar and timestamp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
