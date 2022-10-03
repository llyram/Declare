import React, { useState, useEffect, useRef } from "react";
import { Button } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

import ProfileCircle from "./ProfileCircle";

const Game = ({ socket, name, room, setLoggedIn }) => {
  const [updates, setUpdates] = useState([]);
  const [myTurn, setMyTurn] = useState(false);
  const [sendCard, setSendCard] = useState(-1);
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("");
  const [pick, setPick] = useState(false);
  const [pickOpen, setPickOpen] = useState(false);
  const [pickedOpen, setPickedOpen] = useState(null);
  const [canDeclare, setCanDeclare] = useState(true);
  const [colors, setColors] = useState([
    "#6272a4",
    "#50fa7b",
    "#ffb86c",
    "#ff79c6",
    "#ff5555",
  ]);

  class Card {
    constructor(card) {
      this.card = card;
      const cardValues = {
        "Ace of Hearts": 1,
        "2 of Hearts": 2,
        "3 of Hearts": 3,
        "4 of Hearts": 4,
        "5 of Hearts": 5,
        "6 of Hearts": 6,
        "7 of Hearts": 7,
        "8 of Hearts": 8,
        "9 of Hearts": 9,
        "10 of Hearts": 10,
        "Jack of Hearts": 11,
        "Queen of Hearts": 12,
        "King of Hearts": 13,
        "Ace of Diamonds": 1,
        "2 of Diamonds": 2,
        "3 of Diamonds": 3,
        "4 of Diamonds": 4,
        "5 of Diamonds": 5,
        "6 of Diamonds": 6,
        "7 of Diamonds": 7,
        "8 of Diamonds": 8,
        "9 of Diamonds": 9,
        "10 of Diamonds": 10,
        "Jack of Diamonds": 11,
        "Queen of Diamonds": 12,
        "King of Diamonds": 13,
        "Ace of Clubs": 1,
        "2 of Clubs": 2,
        "3 of Clubs": 3,
        "4 of Clubs": 4,
        "5 of Clubs": 5,
        "6 of Clubs": 6,
        "7 of Clubs": 7,
        "8 of Clubs": 8,
        "9 of Clubs": 9,
        "10 of Clubs": 10,
        "Jack of Clubs": 11,
        "Queen of Clubs": 12,
        "King of Clubs": 13,
        "Ace of Spades": 1,
        "2 of Spades": 2,
        "3 of Spades": 3,
        "4 of Spades": 4,
        "5 of Spades": 5,
        "6 of Spades": 6,
        "7 of Spades": 7,
        "8 of Spades": 8,
        "9 of Spades": 9,
        "10 of Spades": 10,
        "Jack of Spades": 11,
        "Queen of Spades": 12,
        "King of Spades": 13,
      };

      this.value = cardValues[card];
      this.suit = card.substring(card.indexOf(" of ") + 4);
      this.placeHolder = null;
      this.flipped = false;

      var suits = { Hearts: 0, Diamonds: 13, Clubs: 26, Spades: 39 };
      this.position = suits[this.suit] + this.value; //Position in a sorted deck
      this.backgroundPosition = -100 * this.position + "px";
    } //End of Constructor
  } //End of Card class

  // Set card size limit to prevent overscaling
  const styleCardSize = { maxHeight: '150px', maxWidth: '105px' }

  const [opencard, setOpencard] = useState();
  const [playerCards, setPlayerCards] = useState([]);
  const [throwCards, setThrowCards] = useState([]);

  const nextButton = useRef(null);
  const throwing = useRef(null);

  useEffect(() => {
    // Starting values of opnecard, player cards and player names
    socket.current.on("start_variables", ({ opencard, cards, playerNames }) => {
      setOpencard(new Card(opencard));
      let tempCards = [];
      for (let i = 0; i < cards.length; i++) {
        tempCards.push(new Card(cards[i]));
      }
      setPlayerCards(tempCards);
      setPlayers(playerNames);
    });

    // get opencard after every turn
    socket.current.on("open_card", (card) => {
      setOpencard(new Card(card));
    });

    // Updates after any move
    socket.current.on("update", ({ name, send, length }) => {
      setUpdates((updates) => [...updates, `${name} threw ${send}(${length})`]);
    });

    // change of turn
    socket.current.on("your_turn", (player_name) => {
      setCurrentTurn(player_name);
      setCanDeclare(true);
      if (player_name === name) {
        setMyTurn(true);
      }
    });

    // ending the game
    socket.current.on("end_game", (message) => {
      setLoggedIn(false);
      socket.current.emit("leave_room", { name, room });
      window.alert(`${message}`);
    });

    // getting the picked card
    socket.current.on("picked_card", (card) => {
      let newcard = new Card(card);
      setPlayerCards((playerCards) => [...playerCards, newcard]);
      setThrowCards([]);
    });

    // result of declaration
    socket.current.on("declare_result", (result) => {
      window.alert(result);
      socket.current.emit("start_game", room);
    });
  }, [socket.current]);

  useEffect(() => {
    let handValue = getHandValue();
    socket.current.emit("hand_value", { handValue, room });
  }, [playerCards]);

  useEffect(() => {
    if (throwCards.length > 0) {
      setCanDeclare(false);
    } else {
      setCanDeclare(true);
    }
  }, [throwCards]);

  const throwHandler = () => {
    if (sendCard === -1) {
      alert("choose a card to throw");
    } else {
      let update = `${name} threw ${throwCards[0].card}`;
      // socket.current.emit('update', { update, room });
      setPick(true);
      for (let i = 0; i < playerCards.length; i++) {
        if (playerCards[i].value === opencard.value) {
          setPickOpen(true);
        }
      }
    }
  }; //End of throwHandler()

  const pickHandler = (pickedOption) => {
    setPick(false);
    setMyTurn(false);
    setPickOpen(false);
    setPickedOpen(null);
    let send = throwCards[0].card;

    if (pickedOption === "opencard") {
      setPickedOpen(opencard.value);
    }

    socket.current.emit("turn_over", { room, pickedOption });
    let length = throwCards.length;
    socket.current.emit("click", { name, room, send, length });
  };

  const declareHandler = () => {
    const handValue = getHandValue();
    socket.current.emit("declare", { handValue, room });
  };

  const getHandValue = () => {
    let handValue = 0;
    for (let i = 0; i < playerCards.length; i++) {
      handValue += playerCards[i].value;
    }

    return handValue;
  };

  const setThrowCard = (e) => {
    if (!myTurn) {
      return;
    }
    if (getHandValue() === 1) {
      window.alert("you have to declare because you only have an Ace");
      return;
    }
    if (e.target.parentElement.id === "throw") {
      // setSendCard(-1);
      setSendCard(-1);
      const tempArr = [...throwCards];
      setPlayerCards([
        ...playerCards,
        tempArr.splice(parseInt(e.target.id.substring(10) - 1), 1)[0],
      ]);
      setThrowCards(tempArr);
    } else {
      if (pickedOpen !== null) {
        if (playerCards[e.target.id.substring(10) - 1].value !== pickedOpen) {
          window.alert(
            "you can only throw the card that you have picked in the previous round"
          );
          return null;
        }
      }
      if (throwCards.length === 0) {
        setSendCard(parseInt(e.target.id.substring(10)) - 1);
        const tempArr = [...playerCards];
        setThrowCards([
          ...throwCards,
          tempArr.splice(parseInt(e.target.id.substring(10) - 1), 1)[0],
        ]);
        setPlayerCards(tempArr);
      } else {
        if (
          playerCards[parseInt(e.target.id.substring(10) - 1)].value ===
          throwCards[0].value
        ) {
          const tempArr = [...playerCards];
          setThrowCards([
            ...throwCards,
            tempArr.splice(parseInt(e.target.id.substring(10) - 1), 1)[0],
          ]);
          setPlayerCards(tempArr);
        } else {
          window.alert("cards don't have the same value");
        }
      }
    }
  }; // End of setThrowCard

  const endGame = () => {
    setLoggedIn(false);
    socket.current.emit("end_game", room);
  };

  return (
    <div className="game">
      <div className="players flex-centered">
        {players.map((player) => (
          // <Avatar className={classes.orange}>{player.substring(0, 1).toUpperCase()}</Avatar>
          <ProfileCircle
            name={player}
            currentName={currentTurn}
            color={grey[900]}
          />
        ))}
      </div>
      <div className="flex-centered">
        <div id="cards">
          Board:
          <div id="board" className="flex-centered">
            <div className="flex-centered-column button">
              <div id="deck" className="card" style={ styleCardSize }></div>
              <Button
                variant="contained"
                onClick={() => {
                  pickHandler("deck");
                }}
                disabled={!(myTurn && pick)}
              >
                pick from deck
              </Button>
            </div>
            <div className="flex-centered-column button">
              {opencard ? (
                <div
                  id="opencard"
                  className="card"
                  style={{ backgroundPosition: opencard.backgroundPosition, ...styleCardSize }}
                ></div>
              ) : (
                <div></div>
              )}
              <Button
                variant="contained"
                onClick={() => {
                  pickHandler("opencard");
                }}
                disabled={!(myTurn && pick && pickOpen)}
              >
                pick open card
              </Button>
            </div>
            <div className="flex-centered-column button">
              <div className="throw" id="throw" ref={throwing} style={{ height: '100%' }}>
                {throwCards.map((card, index) => (
                  <div
                    id={"playerCard".concat((index + 1).toString())}
                    className="card"
                    onClick={setThrowCard}
                    style={{ backgroundPosition: card.backgroundPosition, ...styleCardSize }}
                  ></div>
                ))}
              </div>
              <Button
                variant="contained"
                onClick={throwHandler}
                disabled={!(myTurn && !pick)}
              >
                throw
              </Button>
            </div>
          </div>
          <hr />
          Player's card:
          <div id="playerCards flex-centered">
            <div id="playercards">
              {playerCards.map((card, index) => (
                <div
                  id={"playerCard".concat((index + 1).toString())}
                  className="card"
                  onClick={setThrowCard}
                  style={{ backgroundPosition: card.backgroundPosition, ...styleCardSize }}
                ></div>
              ))}
            </div>
            <div className="flex-centered-column">
              <div className="button">
                <Button
                  ref={nextButton}
                  variant="contained"
                  disabled={!(myTurn && !pick && canDeclare)}
                  onClick={declareHandler}
                >
                  Declare
                </Button>
              </div>
              <div className="button">
                <Button variant="contained" onClick={endGame}>
                  End game
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="updates">
          <h2>Updates</h2>
          <div className="list">
            <ul>
              {updates.map((update, index) => (
                <li key={index}>{update}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
