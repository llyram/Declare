import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@material-ui/core';

import ProfileCircle from './ProfileCircle';


const Game = ({ socket, name, room, serverId, setLoggedIn }) => {

    const [updates, setUpdates] = useState([]);
    const [myTurn, setMyTurn] = useState(true);
    const [sendCard, setSendCard] = useState("");
    const [players, setPlayers] = useState([]);
    const [currentTurn, setCurrentTurn] = useState("");


    class Card {
        constructor(card) {
            this.card = card;
            const cardValues = { "Ace of Hearts": 1, "2 of Hearts": 2, "3 of Hearts": 3, "4 of Hearts": 4, "5 of Hearts": 5, "6 of Hearts": 6, "7 of Hearts": 7, "8 of Hearts": 8, "9 of Hearts": 9, "10 of Hearts": 10, "Jack of Hearts": 11, "Queen of Hearts": 12, "King of Hearts": 13, "Ace of Diamonds": 1, "2 of Diamonds": 2, "3 of Diamonds": 3, "4 of Diamonds": 4, "5 of Diamonds": 5, "6 of Diamonds": 6, "7 of Diamonds": 7, "8 of Diamonds": 8, "9 of Diamonds": 9, "10 of Diamonds": 10, "Jack of Diamonds": 11, "Queen of Diamonds": 12, "King of Diamonds": 13, "Ace of Clubs": 1, "2 of Clubs": 2, "3 of Clubs": 3, "4 of Clubs": 4, "5 of Clubs": 5, "6 of Clubs": 6, "7 of Clubs": 7, "8 of Clubs": 8, "9 of Clubs": 9, "10 of Clubs": 10, "Jack of Clubs": 11, "Queen of Clubs": 12, "King of Clubs": 13, "Ace of Spades": 1, "2 of Spades": 2, "3 of Spades": 3, "4 of Spades": 4, "5 of Spades": 5, "6 of Spades": 6, "7 of Spades": 7, "8 of Spades": 8, "9 of Spades": 9, "10 of Spades": 10, "Jack of Spades": 11, "Queen of Spades": 12, "King of Spades": 13 };

            this.value = cardValues[card];
            this.suit = card.substring(card.indexOf(" of ") + 4);
            this.placeHolder = null;
            this.flipped = false;

            var suits = { 'Hearts': 0, 'Diamonds': 13, 'Clubs': 26, 'Spades': 39 }
            this.position = suits[this.suit] + this.value; //Position in a sorted deck
            this.backgroundPosition = -100 * this.position + "px";
        } //End of Constructor

        displayCard(placeHolder) {
            this.placeHolder = document.getElementById(placeHolder);
            this.placeHolder.classList.add("card");
            // this.flipped = flipped;
            // this.placeHolder.style.backgroundPosition = -100 * this.position + "px";
        } // End of displayCard


        flip() {
            if (this.flipped) {
                this.placeHolder.style.backgroundPosition = "0px";
                this.flipped = false;
            } else {
                this.placeHolder.style.backgroundPosition = -150 * this.position + "px";
                this.flipped = true;
            }
        } //End of flip()

    } //End of Card class

    // let opencard, playerCard1, playerCard2, playerCard3, playerCard4, playerCard5;
    const opencard = useRef();
    const playerCards = useRef([]);

    const nextButton = useRef(null);
    const throwing = useRef(null);



    useEffect(() => {
        // deal();
        socket.current.on('open_card', (card) => {
            // opencard = card;
            opencard.current = new Card(card);
            document.getElementById('opencard').style.backgroundPosition = opencard.current.backgroundPosition;
            opencard.current.displayCard("opencard");

        });
        socket.current.on('player_cards', (cards) => {
            for (let i = 0; i < cards.length; i++) {
                playerCards.current[i] = new Card(cards[i]);


                // playerCard.current[i].displayCard("playerCard".concat((i+1).toString()), true);
            }
        })
    });

    useEffect(() => {
        socket.current.on('update', (msg) => {
            setUpdates([...updates, msg]);
        })
    });

    useEffect(() => {
        socket.current.on('your_turn', (player_name) => {
            setCurrentTurn(player_name);
            if (player_name === name) {
                setMyTurn(false);
            };

        });
    });

    useEffect(() => {
        socket.current.on('players', (playerNames) => {
            setPlayers(playerNames);
        });
    });

    useEffect(() => {
        socket.current.on('end_game', () => {
            socket.current.emit('leave_room', { name, room });
            setLoggedIn(false);
        });
    });

    const nextStep = () => {
        socket.current.emit('click', { name, room, sendCard });
        setUpdates([...updates, `${name} threw ${sendCard}`]);
        socket.current.emit('turn_over', room);
        setMyTurn(true);
    } //End of nextStep()

    const setThrowCard = (e) => {
        if (e.target.parentElement.id === 'throw') {
            setSendCard("");
            document.getElementById('playercards').appendChild(e.target);

        } else {
            setSendCard(playerCards.current.[parseInt(e.target.id.substring(10)) - 1].card);
            throwing.current.appendChild(e.target);
        }



    };

    const endGame = () => {
        socket.current.emit('end_game', room);
    }



    return (
        <div className="game">
            <div className="players">
                {players.map((player) => (
                    <ProfileCircle
                        name={player}
                        currentName={currentTurn} />
                ))}
            </div>
            <div className="gameclass">
                <div id="cards">
                    Board:
                    <div id="board">
                        <div className="buttons button">
                            <div id="deck" className="card"></div>
                            <Button variant="contained">pick</Button>
                        </div>
                        <div className="buttons button">
                            <div id="opencard" className="card"></div>
                            <Button variant="contained">pick</Button>
                        </div>
                        <div className="buttons button">
                            <div className="throw" id='throw' ref={throwing}>
                            </div>
                            <Button variant="contained" onClick={nextStep}>throw</Button>
                        </div>

                    </div>
                    <hr />
                    Player's card:
                    <div id="playerCards">
                        <div id='playercards'>
                            {playerCards.current.map((card, index) => (
                                <div 
                                    id={"playerCard".concat((index + 1).toString())} 
                                    className="card" 
                                    onClick={setThrowCard}
                                    style={{backgroundPosition:card.backgroundPosition}}
                                ></div>

                            ))}
                        </div>
                        <div className="buttons">
                            <div className="button">
                                <Button ref={nextButton} disabled={myTurn} variant="contained" onClick={nextStep}>Next card</Button>
                            </div>
                            <div className="button">
                                <Button variant="contained" onClick={endGame}>End game</Button>
                            </div>
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
        </div>
    )
};

export default Game;

