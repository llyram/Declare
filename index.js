const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
const ws = require("ws");
const path = require('path');


const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  wsEngine: ws.Server,
});

class Deck {
  constructor() {
    this.deck = [];
    this.reset(); //Add 52 cards to the deck
    this.shuffle(); //Suffle the deck
  } //End of constructor

  reset() {
    this.deck = [];
    const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const values = ["Ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "Jack", "Queen", "King"];

    for (let suit in suits) {
      for (let value in values) {
        this.deck.push(values[value] + " of " + suits[suit]);
      }
    }
  } //End of reset()

  shuffle() {
    let numberOfCards = this.deck.length;
    for (var i = 0; i < numberOfCards; i++) {
      let j = Math.floor(Math.random() * numberOfCards);
      let tmp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = tmp;
    }
  } //End of shuffle()

  deal() {
    return this.deck.pop();
  } //End of deal()

  isEmpty() {
    return this.deck.length == 0;
  } //End of isEmpty()

  length() {
    return this.deck.length;
  } //End of length()
} //End of Deck Class

var sockets = {};

let card1, card2, card3, card4, card5;
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
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static("frontend/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "build", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`server started on Port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log(`user ${socket.id} has connected`);
  io.to(socket.id).emit("server_id", socket.id);

  socket.on("join_room", ({ room, name }) => {
    try {
      socket.join(room);
      socket.nickname = name;
      socket.room = room;
      if (!sockets[room]) {
        sockets[room] = {};
        sockets[room].names = [];
        sockets[room].start = false;
        // sockets[room].names = {name};
      }
      sockets[room].names = [...sockets[room].names, name];
      io.in(room).emit("player_count", io.sockets.adapter.rooms.get(room).size);
      io.in(room).emit("update", `${name} has joined room ${room}`);
      console.log(`${name} joind room ${room}`);
    } catch (err) {
      console.log(err.message);
    }
  });

  socket.on("leave_room", ({ name, room }) => {
    try {
      socket.leave(room);
      delete socket.room;
      delete socket.nickname;
      if (sockets[room]) {
        io.in(room).emit("update", `${name} has left room ${room}`);
        io.in(room).emit(
          "player_count",
          io.sockets.adapter.rooms.get(room).size
        );
        sockets[room].names.splice(sockets[room].names.indexOf(name), 1);
        console.log(`${name} has left ${room}`);
      }
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("update", ({ update, room }) => {
    try {
      io.in(room).emit("update", update);
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("click", ({ name, room, send, length }) => {
    try {
      io.in(room).emit("update", { name, send, length });
      sockets[room].opencard = send;
      io.in(room).emit("open_card", sockets[room].opencard);
    } catch (error) {
      console.log(error.message);
    }
  });
  let current_room;

  socket.on("start_game", (room) => {
    try {
      io.in(room).emit("start_game");
      sockets[room].start = true;
      sockets[room].deck = new Deck();
      if (sockets[room].deck.length() < 7) {
        sockets[room].deck.reset();
        sockets[room].deck.shuffle();
      }
      // sockets[room].handvalues = {}

      sockets[room].opencard = sockets[room].deck.deal();

      io.sockets.adapter.rooms.get(room).forEach((player) => {
        card1 = sockets[room].deck.deal();
        card2 = sockets[room].deck.deal();
        card3 = sockets[room].deck.deal();
        card4 = sockets[room].deck.deal();
        card5 = sockets[room].deck.deal();
        // sockets[room][io.sockets.sockets.get(player).nickname] = cardValues[card1] + cardValues[card2] + cardValues[card3] + cardValues[card4] + cardValues[card5];
        let opencard = sockets[room].opencard;
        let cards = [card1, card2, card3, card4, card5];
        let playerNames = sockets[room].names;
        io.to(player).emit("start_variables", { opencard, cards, playerNames });
      });
      // io.in(room).emit('players', sockets[room].names);
      current_room = Array.from(io.sockets.adapter.rooms.get(room));
      sockets[room]._turn = 0;
      io.in(room).emit(
        "your_turn",
        io.sockets.sockets.get(current_room[0]).nickname
      );
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("end_game", (room) => {
    try {
      console.log("game ended");
      io.in(room).emit("end_game", `${socket.nickname} has ended the game`);
      delete sockets[room];
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("turn_over", ({ room, pickedOption }) => {
    try {
      if (pickedOption === "deck") {
        io.to(socket.id).emit("picked_card", sockets[room].deck.deal());
      } else {
        io.to(socket.id).emit("picked_card", sockets[room].opencard);
      }
      sockets[room]._turn =
        (sockets[room]._turn + 1) % io.sockets.adapter.rooms.get(room).size;
      current_room = Array.from(io.sockets.adapter.rooms.get(room));
      io.in(room).emit(
        "your_turn",
        io.sockets.sockets.get(current_room[sockets[room]._turn]).nickname
      );
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("hand_value", ({ handValue, room }) => {
    try {
      if (!sockets[room].handValues) {
        sockets[room].handValues = {};
      }
      sockets[room].handValues[socket.nickname] = handValue;
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("declare", ({ handValue, room }) => {
    try {
      let caught = false;
      for (const [name, value] of Object.entries(sockets[room].handValues)) {
        if (name === socket.nickname) {
          continue;
        }
        if (value <= handValue) {
          caught = true;
        }
      }
      if (caught) {
        socket
          .to(room)
          .emit(
            "declare_result",
            `${socket.nickname} has declared and has been caught`
          );
        io.to(socket.id).emit(
          "declare_result",
          `your have declared and have been caught`
        );
      } else {
        socket
          .to(room)
          .emit(
            "declare_result",
            `${socket.nickname} has declared and has won this round`
          );
        io.to(socket.id).emit(
          "declare_result",
          `your have declared and have won this round`
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("disconnect", () => {
    try {
      console.log(`${socket.id} has disconnected`);
      if (!socket.room) {
        return
      }
      console.log(sockets[socket.room].start);
      if (sockets[socket.room].start) {
        io.in(socket.room).emit(
          "end_game",
          `${socket.nickname} has left the game`
        );
        delete sockets[socket.room];
      } else {
        io.in(socket.room).emit(
          "player_count",
          io.sockets.adapter.rooms.get(socket.room).size
        );
        sockets[socket.room].names.splice(
          sockets[socket.room].names.indexOf(socket.nickname)
        );
        io.emit("update", `${socket.nickname} has left`);
      }
    } catch (error) {
      console.log(error.message);
    }
  });
});
