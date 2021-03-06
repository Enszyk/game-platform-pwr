import { ref, computed } from 'vue';
import { selectGameToPlay, makeMove, getCurrGameDetails, roomDetails } from "./SocketConnection"
import { getUsername } from './TokenService'

export enum AvaliableGames {
  'tictactoe' = 'Tictactoe',
  'rpsls' = 'Rpsls'
}



const gamesToPlay = ref<AvaliableGames[]>([AvaliableGames.tictactoe, AvaliableGames.rpsls])
export const gameComponent = ref<AvaliableGames>()



export const chooseGame = (gameName: AvaliableGames) => {
  selectGameToPlay(gameName)
}

export const move = (field: string) => {
  makeMove(field)
}

export const initGame = (gameName: AvaliableGames) => {
  gameComponent.value = gameName;
}

export const exitGame = () => {
  gameComponent.value = undefined
}

export const getPlayerInPosition = (pos: number) => {
  return getCurrGameDetails.value.players[pos]
}

export const isMyTurn = computed(() => {
  const roomInfo = getCurrGameDetails
  if (roomInfo.value && roomInfo.value.playersMoveOrder && roomInfo.value.playersMoveOrder.length) {
    return roomInfo.value.playersMoveOrder[0] === getUsername()
  }
  return false
})
export const canGameBeStarted = computed(() => {
  let playerCount = 0
  for (const player of getCurrGameDetails.value.players)
    if (player)
      playerCount++
  return (
    playerCount > 0 &&
    playerCount >= getCurrGameDetails.value.minPlayers
    && playerCount <= getCurrGameDetails.value.maxPlayers)
})


export const getGames = computed(() => gamesToPlay.value)
export const getGameComponent = computed(() => gameComponent.value)
export const getGameState = computed(() => getCurrGameDetails.value.gameState)
export const gameEnded = computed(() => getCurrGameDetails.value.result && Object.keys(getCurrGameDetails.value.result).length > 0)
export const isInitiated = computed(() => !!roomDetails.value.game)
export const gameStarted = computed(() => getCurrGameDetails.value.gameStarted)
export const getResult = computed(() => getCurrGameDetails.value.result)


