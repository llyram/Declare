import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import io from "socket.io-client";

// importing components
import LoginPage from "./components/LoginPage";
import GamePage from "./components/GamePage";

// const CONNECTION = 'localhost:4000';
const CONNECTION = "/";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  const socket = useRef();

  useEffect(() => {
    socket.current = io(CONNECTION, {
      transports: ["websocket"],
    });
  }, [socket]);

  

  return (
    <div className="App flex-centered">
      {loggedIn ? (
        <GamePage
          room={room}
          socket={socket}
          name={name}
          setLoggedIn={setLoggedIn}
        />
      ) : (
        <LoginPage
          socket={socket}
          setLoggedIn={setLoggedIn}
          name={name}
          setName={setName}
          room={room}
          setRoom={setRoom}
        />
      )}
    </div>
  );
};

export default App;
