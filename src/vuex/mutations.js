import { LOCATION, SECONDARY, shuffleArray } from '../js/GameHelper'

export default {

  setPlayerName (state, name) {
    state.player.name = name
    localStorage.setItem('playerName', name)
  },

  /*
   * Set the game state to the following defined base state
   * reset() must be called before any new game is initiated
   */
  reset (state, resetState) {
    state.player.name = resetState.player.name
    state.game.id = resetState.game.id
    state.game.state = resetState.game.state
    state.game.deck = resetState.game.deck
    state.game.players = resetState.game.players
    state.game.lastCardPlayed = resetState.game.lastCardPlayed
    state.game.specialAttackStack = resetState.game.specialAttackStack
    state.game.statusMessage = resetState.game.statusMessage
    state.game.cpuBoardAction = resetState.game.cpuBoardAction
    state.game.currentColour = resetState.game.currentColour
  },

  /*
   * Add a player to the game state after reset() has been called
   */
  addPlayer (state, player) {
    state.game.players.push(player)
  },

  /*
   * Shuffle the players to determine the playing order
   */
  shufflePlayers (state) {
    shuffleArray(state.game.players)
  },

  /*
   * Deal 7 cards to each player
   */
  dealCards (state) {
    for (var i = 0; i < 7; i++) {
      state.game.deck[i * 4].location = LOCATION.PLAYER1
      state.game.deck[i * 4 + 1].location = LOCATION.PLAYER2
      state.game.deck[i * 4 + 2].location = LOCATION.PLAYER3
      state.game.deck[i * 4 + 3].location = LOCATION.PLAYER4
    }
  },

  /*
   * End a player's turn
   */
  switchPlayer (state) {
    var player = state.game.players.shift()
    state.game.players.push(player)
    // check for additional turn, and removes the artifact
    var lastElement = state.game.players[state.game.players.length - 1]
    if (lastElement.id === state.game.players[0].id) {
      state.game.players.pop()
    }
    // check for skip turn, and skips the next player's turn
    if (state.game.players[0].skipTurn) {
      player = state.game.players.shift()
      player.skipTurn = false
      state.game.players.push(player)
    }
  },

  startCurrentTurn (state) {
    state.game.players[0].currentTurn = true
  },

  endCurrentTurn (state) {
    state.game.players[0].currentTurn = false
  },

  playCard (state, card) {
    var oldLocation = state.game.deck.find(deckCard => deckCard.color === card.color && deckCard.secondary === card.secondary).location
    state.game.deck.find(deckCard => deckCard.color === card.color && deckCard.secondary === card.secondary).location = LOCATION.PLAYED_STACK
    state.game.lastCardPlayed = card
    state.game.lastCardPlayed.color = state.game.currentColour
    if (state.game.deck.filter(card => card.location === oldLocation).length === 0) {
      state.game.gameState = 'Game Over: ' + oldLocation + ' wins!'
    }
  },

  drawCard (state, playerNumber) {
    function repopulateDrawStack () {
      var drawStack = state.game.deck.filter(card => card.location === LOCATION.DRAW_STACK)
      if (drawStack.length === 0) {
        var playedStack = state.game.deck.filter(card => card.location === LOCATION.PLAYED_STACK)
        for (var i = 0; i < playedStack.length; i++) {
          playedStack[i].location = LOCATION.DRAW_STACK
        }
      }
    }

    // If there are attacks stacked, then drawing means that the player has lost the attack
    if (state.game.specialAttackStack) {
      // draw cards equal to the value of the stack and then reset the stack value
      for (var i = 0; i < state.game.specialAttackStack - 1; i++) {
        var spCard = state.game.deck.find(deckCard => deckCard.location === LOCATION.DRAW_STACK)
        spCard.location = playerNumber
        console.log(playerNumber + ' special attack stack drew card ' + spCard.color + '-' + spCard.secondary)
        repopulateDrawStack()
      }
      state.game.specialAttackStack = 0
    }

    var card = state.game.deck.find(deckCard => deckCard.location === LOCATION.DRAW_STACK)
    card.location = playerNumber
    repopulateDrawStack()
    console.log(playerNumber + ' drew card ' + card.color + '-' + card.secondary)
  },

  switchDirection (state) {
    /*
     * grab the current player, reverse the array, and add the current player back on the front
     * the current player will be moved to the back of the player array by a later call to switchPlayer
     */
    var currentPlayer = state.game.players.shift()
    state.game.players.reverse()
    state.game.players.unshift(currentPlayer)
  },

  additionalTurn (state) {
    var currentPlayerCopy = JSON.parse(JSON.stringify(state.game.players[0]))
    currentPlayerCopy.currentTurn = false
    state.game.players.splice(1, 0, currentPlayerCopy)
  },

  skipTurn (state) {
    state.game.players[1].skipTurn = true
  },

  attackStack (state, card) {
    state.game.specialAttackStack += (card.secondary === SECONDARY.SINGLE_ATTACK) ? 1 : 2

    // We chose 10 as the max attack stacking value
    if (state.game.specialAttackStack > 10) {
      state.game.specialAttackStack = 10
    }
  },

  changeColour (state, colour) {
    state.game.currentColour = colour
  },

  gameStateMessage (state, message) {
    state.game.gameState = message
  },

  changeCpuBoardAction (state, playerNumber) {
    state.game.cpuBoardAction = playerNumber
  },

  repopulateDrawStack (state) {
    var drawStack = state.game.deck.filter(card => card.location === LOCATION.DRAW_STACK)
    if (drawStack.length === 0) {
      var playedStack = state.game.deck.filter(card => card.location === LOCATION.PLAYED_STACK)
      for (var i = 0; i < playedStack.length; i++) {
        playedStack[i].location = LOCATION.DRAW_STACK
      }
    }
  }
}
