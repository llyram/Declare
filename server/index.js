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

let card1, card2, card3, card4, card5;
var current_turn = 0;

function deal() {
    if (deck.length() < 7) {
        deck.reset();
        deck.shuffle();
    }
    card1 = new Card(deck.deal());
    card2 = new Card(deck.deal());
    card3 = new Card(deck.deal());
    card4 = new Card(deck.deal());
    card5 = new Card(deck.deal());
    playerCard1 = new Card(deck.deal());
    playerCard2 = new Card(deck.deal());


    card1.displayCard('card1', false);
    card2.displayCard('card2', false);
    card3.displayCard('card3', false);
    card4.displayCard('card4', false);
    card5.displayCard('card5', false);
    playerCard1.displayCard("playerCard1", true);
    playerCard2.displayCard("playerCard2", true);
} //End of deal()


// deal();

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
        io.in(room).emit('player_count', io.sockets.adapter.rooms.get(room).size);
        io.in(room).emit('update', `${name} has joined room ${room}`);
        console.log(`${name} joind room ${room}`);
    });

    socket.on('leave_room', ({ name, room }) => {
        socket.leave(room);
        io.in(room).emit('update', `${name} has left room ${room}`);
    })

    socket.on('click', ({ name, room }) => {
        socket.broadcast.emit('update', `${name} clicked the button`);
        io.in(room).emit('open_card', decks[room].deal());
    });

    socket.on('start_game', (room) => {
        io.in(room).emit('start_game', null);
        decks[room] = new Deck();
        if (decks[room].length() < 7) {
            decks[room].reset();
            decks[room].shuffle();
        }
        io.in(room).emit('open_card', decks[room].deal());

        io.sockets.adapter.rooms.get(room).forEach(player => {
            card1 = decks[room].deal()
            card2 = decks[room].deal()
            card3 = decks[room].deal()
            card4 = decks[room].deal()
            card5 = decks[room].deal()
            io.to(player).emit('player_cards', {
                card1, card2, card3, card4, card5
            });
        });

        console.log(Array.from(io.sockets.adapter.rooms.get(room))[0]);
        io.to(Array.from(io.sockets.adapter.rooms.get(room))[current_turn]).emit('your_turn', null);




    });

    socket.on('turn_over', (room) => {
        console.log("next turn");
        current_turn = (current_turn + 1) % io.sockets.adapter.rooms.get(room).size;
        io.to(Array.from(io.sockets.adapter.rooms.get(room))[current_turn]).emit('your_turn', null);
    });

    socket.on('disconnect', (socket) => {
        console.log(`${socket.nickname} has disconnected`);
        io.emit('update', "a user has disconnected");
    });
})