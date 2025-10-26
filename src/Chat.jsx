import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useSelector } from "react-redux";

import { createSocketConnection } from "./utils/socket";
import { BASE_URL } from "./utils/constants";


const Chat = () => {
  const { id } = useParams();
  console.log(id,"id")
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const firstName = user?.firstName
  const lastName = user?.lastName

  // const fetchChatMessages = async () => {
  //   const chat = await axios.get(BASE_URL + "/chat/" + id, {
  //     withCredentials: true,
  //   });

  //   console.log(chat.data.messages);

  //   const chatMessages = chat?.data?.messages.map((msg) => {
  //     const { senderId, text } = msg;
  //     return {
  //       firstName: senderId?.firstName,
  //       lastName: senderId?.lastName,
  //       text,
  //     };
  //   });
  //   setMessages(chatMessages);
  // };
  // useEffect(() => {
  //   fetchChatMessages();
  // }, []);

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

  const sendMessage = () => {
    const socket = createSocketConnection();
    socket.emit("sendMessage", {
      firstName: firstName,
      lastName: lastName,
      userId,
      id,
      text: newMessage,
    });
    setNewMessage("");
  };

  return (
    <div className="w-3/4 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col">
      <h1 className="p-5 border-b border-gray-600">Chat</h1>
      <div className="flex-1 overflow-scroll p-5">
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
      <div className="p-5 border-t border-gray-600 flex items-center gap-2">
        <input
       value={newMessage}
        onChange={(e)=>setNewMessage(e.target.value)}
        ></input>
        <button onClick={sendMessage} className="btn btn-secondary">
          Send
        </button>
      </div>
    </div>
  );
};
export default Chat;