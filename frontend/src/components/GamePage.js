import React, { useState, useEffect } from "react";
import { Button } from "@material-ui/core";
import Game from "./Game";

const GamePage = ({ socket, name, room, setLoggedIn }) => {
  const [start, setStart] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [updates, setUpdates] = useState([]);


  useState(() => {
    socket.current.on("player_count", (count) => {
      setPlayerCount(count);
    });
    socket.current.on("start_game", () => {
      setStart(true);
    });
  }, [socket.current]);

  useEffect(() => {
    socket.current.on("update", (msg) => {
      setUpdates((updates) => [...updates, msg]);
    });
  }, [socket.current]);

  const startGame = () => {
    if (playerCount < 2) {
      window.alert("you need at least 2 players to start the game");
      return null;
    }
    socket.current.emit("start_game", room);
    console.log("start game");
  };

  const leaveRoom = () => {
    socket.current.emit("leave_room", { name, room });
    setLoggedIn(false);
  };

  return (
    <div className="gamepage">
      {start ? (
        <Game
          room={room}
          socket={socket}
          name={name}
          setLoggedIn={setLoggedIn}
        />
      ) : (
        <div className="flex-centered">
          <div className="login flex-centered-column">
            <h2>
              You have joined room <span style={{ color: "blue" }}>{room}</span>{" "}
            </h2>
            <h2>there are currently {playerCount} player(s) in this room</h2>
            <h1>Start the game?</h1>
            <div className="actions">
              <div className="button">
                <Button
                  color="primary"
                  variant="contained"
                  onClick={startGame}
                  className="abutton"
                >
                  {" "}
                  start{" "}
                </Button>
              </div>
              <div className="button">
                <Button color="primary" variant="contained" onClick={leaveRoom}>
                  {" "}
                  Leave room{" "}
                </Button>
              </div>
            </div>
          </div>
          <div className="updates">
            <ul>
              {updates.map((update, index) => (
                <li key={index}>{update}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
