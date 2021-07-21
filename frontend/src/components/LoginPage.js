import React from 'react';
import { Button, TextField } from '@material-ui/core';


const LoginPage = ({ socket, setLoggedIn, name, setName, room, setRoom }) => {




    const nameChangeHandler = (e) => {
        setName(e.target.value);
    };
    const roomChangeHandler = (e) => {
        setRoom(e.target.value);
    };

    const joinRoomHandler = () => {
        socket.current.emit('join_room', { room, name });
        setLoggedIn(true);
    };

    return (
        <div className="login">
            <h1>Castelino's Card game</h1>
            <TextField
                value={name}
                onChange={nameChangeHandler}
                className='textfield'
                variant='outlined'
                label='Name'
            />
            <TextField
                value={room}
                onChange={roomChangeHandler}
                className='textfield'
                variant='outlined'
                label='room id'
            />
            <div className="button">
                <Button color="primary" variant="contained" onClick={joinRoomHandler} >connect</Button>
            </div>

        </div>
    )
};

export default LoginPage;

