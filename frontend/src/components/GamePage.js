import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import Game from './Game';


const GamePage = ({ socket, name, room }) => {

    const [start, setStart] = useState(false);
    const [playerCount, setPlayerCount] = useState(0);
    const [list, setlist] = useState([]);

    useState(() => {
        socket.current.on('player_count', (count) => {
            setPlayerCount(count);
        });
        socket.current.on('joined_room', (update) => {
            setlist([...list, update ]);
            // console.log(update);
        });
        socket.current.on('start_game', () => {
            setStart(true);
        })
        
    });

    const startGame = () => {
        // setStart(true);
        socket.current.emit('start_game', room);
    };

    return (
        <div className="gamepage">
            {start ?

                <Game
                    room={room}
                    socket={socket}
                    name={name}
                /> :
                (
                    <div className="game">
                        <div className="login">
                            <h2>joined room <span style={{ color: 'blue' }} >{room}</span> </h2>
                            <h2>there are currently {playerCount} players in this room</h2>
                            <h1>Start the game?</h1>
                            <Button color="primary" variant="contained" onClick={startGame}> start </Button>
                        </div>
                        <div className="updates">
                            <ul>
                                {list.map((update) => (
                                    <li>{update}</li>
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

