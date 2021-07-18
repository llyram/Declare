import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import io from 'socket.io-client';

// importing components
import Login_page from './components/LoginPage';
import Game from './components/Game';
import GamePage from './components/GamePage';


const CONNECTION = 'localhost:4000';

const App = () => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  const socket = useRef();
  const server_id = useRef();

  useEffect(() => {
    socket.current = io(CONNECTION);
  }, []);

  useEffect(() => {
    socket.current.on('server_id', (id) => {
      server_id.current = id;
      console.log(server_id.current);
    });
  })

  return (
    <div className="App">
      {
        loggedIn ?
          <GamePage
            room = {room}
            socket={socket}
            name={name}
            setLoggedIn={setLoggedIn}
          /> :
          <Login_page
            socket={socket}
            setLoggedIn={setLoggedIn}
            name={name}
            setName={setName}
            room = {room}
            setRoom={setRoom}
          />}

    </div>
  );
}

export default App;
