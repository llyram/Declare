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
        <div className="flex-centered">
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

            <div className="rules flex-centered-column">
                <h1>## Rules:</h1>
                <div>
                <ol>
                    <li>Each player gets dealt 5 cards which only they can see</li>
                    <li>there is on open card face up on the board along with the deck</li>
                    <li>The immediate objective of the player is to reduce the total value of your hand.</li>
                    <li>one after the other players play their turn in which they can throw any single card or pair of cards with the same value.</li>
                    <li>after throwing a card or a pair of cards the player **has to** either pick up a card from the deck **or** pick up the open card if and only if they have at least one card to pair up the open card with.</li>
                    <li>If the player picks up the open card in their turn then they **must throw** the pair at their next turn.</li>
                    <li>The round ends when one of the player *declares* their hand and two outcomes can occur</li>
                    <li>if the total value of the hand of the player who *declared* is less than any of the other players then the player wins the round and every other player get the value of their hand added to the total points.</li>
                    <li>if any of the other players have a total value lower than that of the player who has *declared* then the declarer is *caught* and he gets a penalty of 50 added to their total points.</li>
                    <li>the goal of each round is to reduce the total value of you hand and declaring if you think your hand is lower than everyone else's or wait for someone else to declare and see if your hand is lower than their's</li>
                    <li>If after any turn a player has only one card left with them and the card is the *Ace* of any suit then the player must declare cumpulsorily declare on their next turn.</li>
                    <li> After the desired number of rounds the rankings of the players are decided based on their points in the table. The lower the points of the player the higher their rank. The player with the lowest total points on the table wins.</li>
                    <li> **Value of each card**: every number card has the value of their number. Ace is 1. Every face card, i.e., King, Queen, and Jack, have the value 10.</li>
                </ol>
                </div>

            </div>

        </div>
    )
};

export default LoginPage;

