# Castelino's Card Game
A multiplayer card game created using SocketIO, ReactJS, NodeJS and express.

![screenshot](https://imgur.com/HGny4KH.png)

## Rules:
1. Each player gets dealt 5 cards which only they can see
2. there is on open card face up on the board along with the deck
3. The immediate objective of the player is to reduce the total value of your hand.
4. one after the other players play their turn in which they can throw any single card or pair of cards with the same value.
5. after throwing a card or a pair of cards the player **has to** either pick up a card from the deck **or** pick up the open card if and only if they have at least one card to pair up the open card with.
6. If the player picks up the open card in their turn then they **must throw** the pair at their next turn.
7. The round ends when one of the player *declares* their hand and two outcomes can occur
    1. if the total value of the hand of the player who *declared* is less than any of the other players then the player wins the round and every other player get the value of their hand added to the total points.
    2. if any of the other players have a total value lower than that of the player who has *declared* then the declarer is *caught* and he gets a penalty of 50 added to their total points.
8. the goal of each round is to reduce the total value of you hand and declaring if you think your hand is lower than everyone else's or wait for someone else to declare and see if your hand is lower than their's
9. If after any turn a player has only one card left with them and the card is the *Ace* of any suit then the player must declare cumpulsorily declare on their next turn.
10. After the desired number of rounds the rankings of the players are decided based on their points in the table. The lower the points of the player the higher their rank. The player with the lowest total points on the table wins.
11. **Value of each card**: every number card has the value of their number. Ace is 1. Every face card, i.e., King, Queen, and Jack, have the value 10.
