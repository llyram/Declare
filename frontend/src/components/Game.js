import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField } from '@material-ui/core';


const Game = ({ socket, name, room }) => {

    const [updates, setUpdates] = useState([]);
    const [myTurn, setMyTurn] = useState(true);


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
        } //End of Constructor

        displayCard(placeHolder, flipped = true) {
            this.placeHolder = document.getElementById(placeHolder);
            // this.placeHolder.classList.add("card");
            this.flipped = flipped;
            if (flipped) {
                this.placeHolder.style.backgroundPosition = -100 * this.position + "px";
            } else {
                this.placeHolder.style.backgroundPosition = "0px";
            }
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
    const playerCard1 = useRef();
    const playerCard2 = useRef();
    const playerCard3 = useRef();
    const playerCard4 = useRef();
    const playerCard5 = useRef();

    const nextButton = useRef(null);



    useEffect(() => {
        // deal();
        socket.current.on('open_card', (card) => {
            // opencard = card;
            opencard.current = new Card(card);
            opencard.current.displayCard("opencard", true);
        });
        socket.current.on('player_cards', ({card1, card2, card3, card4, card5}) => {
            playerCard1.current = new Card(card1);
            playerCard2.current = new Card(card2);
            playerCard3.current = new Card(card3);
            playerCard4.current = new Card(card4);
            playerCard5.current = new Card(card5);

            playerCard1.current.displayCard("playerCard1", true);
            playerCard2.current.displayCard("playerCard2", true);
            playerCard3.current.displayCard("playerCard3", true);
            playerCard4.current.displayCard("playerCard4", true);
            playerCard5.current.displayCard("playerCard5", true);
        })
    });

    useEffect(() => {
        socket.current.on('update', (msg) => {
            setUpdates([...updates, msg ]);
        })
    });

    useEffect(() => {
        socket.current.on('your_turn', () => {
            // console.log(nextButton.current);
            console.log('my turn');
            setMyTurn(false);
            // nextButton.current.disabled = false;
        });
    });

    const nextStep = () => {
        socket.current.emit('click', {name, room});
        setUpdates([...updates, `${name} clicked the button` ]);
        socket.current.emit('turn_over', room);
        setMyTurn(true);
    } //End of nextStep()



    return (
        <div className="game">
            <div id="cards">
                Board:<div id="board">
                    <div id="deck" className="card"></div>
                    <div id="opencard" className="card"></div>
                </div>
                <hr />
                Player's card:
                <div id="playerCards">
                    <div id="playerCard1" className="card" draggable="true"></div>
                    <div id="playerCard2" className="card"></div>
                    <div id="playerCard3" className="card"></div>
                    <div id="playerCard4" className="card"></div>
                    <div id="playerCard5" className="card"></div>
                    <Button ref={nextButton} disabled={myTurn} variant="contained" onClick={nextStep}>Next card</Button>
                </div>
            </div>
            <div className="updates">
                <ul>
                    {updates.map((update) => (
                        <li>{update}</li>
                    ))}
                </ul>

            </div>
        </div>
    )
};

export default Game;

