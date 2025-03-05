import React, { useState } from "react";

const Messages = ({ selectedChannel }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    //change depending on the users in db
    { user: "Karan", text: "Hi everyone! Welcome to the channel." },
    { user: "Yassine", text: "Looking forward to discussing!" },
  ]);

}