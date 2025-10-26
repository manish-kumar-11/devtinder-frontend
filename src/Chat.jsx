// ...existing code...
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import { useSelector } from "react-redux";

import { createSocketConnection } from "./utils/socket";
import { BASE_URL } from "./utils/constants";


const Chat = () => {
  const { id } = useParams();
  console.log(id,"id")
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState([]);
  const textareaRef = useRef(null);
  const pickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const firstName = user?.firstName
  const lastName = user?.lastName

  const EMOJIS = [
    "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
    "🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚",
    "😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩",
    "🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣",
    "😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬",
    "🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗",
    "🤔","🤭","🤫","🤥","😶","😐","😑","🫠","💀","👋",
    "👌","👍","👎","🙏","👏","🙌","💪","🤝","❤️","💔",
    "🔥","✨","🎉","🌟","🎯","🏆","🌈","🍀","☕","🍕"
  ];

  // load recent from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recentEmojis_v1");
      if (raw) setRecentEmojis(JSON.parse(raw));
    } catch (e) { 
      console.log(e)
     }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showEmojiPicker &&
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // keep recent emojis (most-recent-first, unique, limit 12)
  const pushRecent = (emoji) => {
    setRecentEmojis((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 12);
      try { localStorage.setItem("recentEmojis_v1", JSON.stringify(next)); } catch(e){
        console.log(e)
      }
      return next;
    });
  };

  useEffect(() => {
    if (!userId) {
      return;
    }
    const socket = createSocketConnection();
    // As soon as the page loaded, the socket connection is made and joinChat event is emitted
    socket.emit("joinchat", {
      firstName: firstName,
      userId,
      id,
    });

    socket.on("messageReceived", ({ firstName, lastName, text }) => {
      console.log(firstName + " :  " + text);
      setMessages((messages) => [...messages, { firstName, lastName, text }]);
      
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, id]);

  const insertAtCursor = (value) => {
    const ta = textareaRef.current;
    if (!ta) {
      setNewMessage((prev) => prev + value);
      return;
    }
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? start;
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(end);
    const next = before + value + after;
    setNewMessage(next);
    // update caret after DOM update
    requestAnimationFrame(() => {
      const pos = start + value.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  const onSelectEmoji = (emoji) => {
    insertAtCursor(emoji);
    pushRecent(emoji);
    // keep picker open like WhatsApp; user can close manually
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const socket = createSocketConnection();
    socket.emit("sendMessage", {
      firstName: firstName,
      lastName: lastName,
      userId,
      id,
      text: newMessage,
    });
    setNewMessage("");
    setShowEmojiPicker(false);
  };

  return (
    <div className="w-3/4 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col relative">
      <h1 className="p-5 border-b border-gray-600">Chat</h1>
      <div className="flex-1 overflow-auto p-5">
        {messages.map((msg, index) => {
          return (
            <div
              key={index}
              className={
                "chat " +
                (firstName === msg.firstName ? "chat-end" : "chat-start")
              }
            >
              <div className="chat-header">
                 {`${msg.firstName}  ${msg.lastName}`}
                <time className="text-xs opacity-50"> 2 hours ago</time>
              </div>
              <div className="chat-bubble">{msg.text}</div>
              <div className="chat-footer opacity-50">Seen</div>
            </div>
          );
        })}
      </div>

      {/* Input / emoji area */}
      <div className="p-3 border-t border-gray-600 flex items-end gap-2 relative">
        <div className="flex-1 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e)=>setNewMessage(e.target.value)}
            className="textarea textarea-bordered w-full resize-none h-16"
            placeholder="Type a message..."
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />

          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => setShowEmojiPicker(s => !s)}
            className="btn btn-ghost btn-sm"
            aria-label="Toggle emoji picker"
          >
            😊
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={sendMessage} className="btn btn-primary">
            Send
          </button>
        </div>

        {/* Emoji picker (WhatsApp-like) */}
        {showEmojiPicker && (
          <div
            ref={pickerRef}
            className="absolute right-3 bottom-20 w-80 bg-base-200 border rounded-lg shadow-lg p-2 z-50"
            role="dialog"
            aria-label="Emoji picker"
          >
            {/* Recent row */}
            {recentEmojis.length > 0 && (
              <div className="mb-2">
                <div className="text-xs opacity-60 mb-1">Recent</div>
                <div className="flex gap-1 flex-wrap">
                  {recentEmojis.map((e) => (
                    <button
                      key={"r"+e}
                      onClick={() => onSelectEmoji(e)}
                      className="p-1 text-2xl rounded hover:bg-base-300"
                      aria-label={`Insert ${e}`}
                      type="button"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs opacity-60 mb-1">Emojis</div>
            <div className="grid grid-cols-8 gap-1 max-h-48 overflow-auto">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelectEmoji(emoji)}
                  className="text-2xl p-1 hover:bg-base-300 rounded"
                  aria-label={`Insert ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Chat;
// ...existing code...