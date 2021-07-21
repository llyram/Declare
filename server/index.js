const express = require("express");
const app = express();
const cors = require('cors');
const server = require('http').createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

class Deck {
    constructor() {
        this.deck = [];
        this.reset(); //Add 52 cards to the deck
        this.shuffle(); //Suffle the deck
    } //End of constructor


    reset() {
        this.deck = [];
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King'];

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
        return (this.deck.length == 0);
    } //End of isEmpty()

    length() {
        return this.deck.length;
    } //End of length()

} //End of Deck Class

var decks = {}
var rooms = {}

let card1, card2, card3, card4, card5;

PORT = 4000


app.use(cors());
app.use(express.json());


server.listen(PORT, () => {
    console.log(`server started on Port ${PORT}`);
});


io.on('connection', (socket) => {
    console.log(`user ${socket.id} has connected`);
    io.to(socket.id).emit('server_id', socket.id);

    socket.on('join_room', ({ room, name }) => {
        socket.join(room);
        socket.nickname = name;
        if (!rooms[room]) {
            rooms[room] = {};
            rooms[room].names = [];
            // rooms[room].names = {name};
        }
        rooms[room].names = [ ...rooms[room].names, name ];
        io.in(room).emit('player_count', io.sockets.adapter.rooms.get(room).size);
        io.in(room).emit('update', `${name} has joined room ${room}`);
        console.log(`${name} joind room ${room}`);
    });

    socket.on('leave_room', ({ name, room }) => {
        socket.leave(room);
        io.in(room).emit('update', `${name} has left room ${room}`);
        console.log(`${name} has left ${room}`);
    })

    socket.on('click', ({ name, room, sendCard }) => {
        socket.broadcast.emit('update', `${name} threw ${sendCard}`);
        io.in(room).emit('open_card', sendCard);
    });
    let current_room;

    socket.on('start_game', (room) => {
        io.in(room).emit('start_game', null);
        decks[room] = new Deck();
        if (decks[room].length() < 7) {
            decks[room].reset();
            decks[room].shuffle();
        }
        io.in(room).emit('open_card', decks[room].deal());
        // let playerNames = [];

        io.sockets.adapter.rooms.get(room).forEach((player) => {
            console.log(io.sockets.sockets.get(player).nickname);
            card1 = decks[room].deal()
            card2 = decks[room].deal()
            card3 = decks[room].deal()
            card4 = decks[room].deal()
            card5 = decks[room].deal()
            io.to(player).emit('player_cards', [card1, card2, card3, card4, card5]);
        });
        console.log(rooms[room].names);
        io.in(room).emit('players', rooms[room].names);
        current_room = Array.from(io.sockets.adapter.rooms.get(room));
        rooms[room]._turn = 0;
        io.in(room).emit('your_turn', io.sockets.sockets.get(current_room[0]).nickname);
    });

    socket.on('end_game', (room) => {
        console.log("game ended");
        io.in(room).emit('end_game');
        delete rooms[room];
    });

    socket.on('turn_over', (room) => {
        console.log("next turn");
        rooms[room]._turn = (rooms[room]._turn + 1) % io.sockets.adapter.rooms.get(room).size;
        current_room = Array.from(io.sockets.adapter.rooms.get(room));
        io.in(room).emit('your_turn', io.sockets.sockets.get(current_room[rooms[room]._turn]).nickname);
    });

    socket.on('disconnect', (socket) => {
        console.log(`${socket.nickname} has disconnected`);
        io.emit('update', "a user has disconnected");
    });
})