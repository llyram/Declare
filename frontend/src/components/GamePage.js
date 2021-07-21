import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import Game from './Game';


const GamePage = ({ socket, name, room, setLoggedIn, serverId }) => {

    const [start, setStart] = useState(false);
    const [playerCount, setPlayerCount] = useState(0);
    const [updates, setUpdates] = useState([]);

    useState(() => {
        socket.current.on('player_count', (count) => {
            setPlayerCount(count);
        });
        socket.current.on('start_game', () => {
            setStart(true);
        })

    });

    useEffect(() => {
        socket.current.on('update', (msg) => {
            setUpdates([...updates, msg]);
        })
    });

    const startGame = () => {
        // setStart(true);
        socket.current.emit('start_game', room);
    };

    const leaveRoom = () => {
        socket.current.emit('leave_room', { name, room });
        setLoggedIn(false);
    };

    return (
        <div className="gamepage">
            {start ?

                <Game
                    room={room}
                    socket={socket}
                    name={name}
                    serverId={serverId}
                    setLoggedIn={setLoggedIn}
                /> :
                (
                    <div className="gameclass">
                        <div className="login">
                            <h2>joined room <span style={{ color: 'blue' }} >{room}</span> </h2>
                            <h2>there are currently {playerCount} players in this room</h2>
                            <h1>Start the game?</h1>
                            <div className="actions">
                                <div className="button">
                                    <Button color="primary" variant="contained" onClick={startGame} className="abutton"> start </Button>
                                </div>
                                <div className="button">
                                    <Button color="primary" variant="contained" onClick={leaveRoom} > Leave room </Button>
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
                )

            }

        </div>
    )
};

export default GamePage;

