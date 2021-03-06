import router from '@/router';
import { getUsername } from './TokenService'
import io, { Socket } from 'socket.io-client'
import { ref, computed } from 'vue';
import { AvaliableGames, initGame } from "./GamesService"
import { setPasswordWrong, showEnterPasswordModal } from '@/use/modalControl';

interface RoomInterface {
  name: string;
  users: string[];
  id: number;
  admin: string;
  game: AvaliableGames;
  hasPassword: boolean;
}

interface CurrGameDetails {
  playersMoveOrder: string[];
  gameState: string[];
  maxPlayers: number;
  minPlayers: number;
  gameStarted: boolean;
  players: string[];
  result?: object;
  notInitiated?: boolean;
}


let socket = null as unknown as Socket;
const rooms = ref<RoomInterface[]>([])
const currGameDetails = ref<CurrGameDetails>({
  playersMoveOrder: [],
  gameState: [],
  minPlayers: NaN,
  maxPlayers: NaN,
  gameStarted: false,
  notInitiated: true,
  players: []
})
const messages = ref<string[]>([])
const players = ref<string[]>([])
const currentRoom = ref<number>()

const addOnEvents = () => {
  socket.on("rooms", (roomsInfo) => {
    rooms.value = roomsInfo;
  });

  socket.on("join-created-room", (id) => {
    router.push({ name: "Room", params: { id: id } });
  });

  socket.on("wrong-password-kick", () => {
    showEnterPasswordModal()
    setPasswordWrong()
  })

  socket.on("chat-message", ({ message, nickname }) => {
    messages.value.push(`${nickname}: ${message}`);
  });

  socket.on("user-connected", (nickname) => {
    messages.value.push(`${nickname} joined!`);
  });

  socket.on("user-disconnected", (nickname) => {
    messages.value.push(`${nickname} disconneted!`);
  });

  socket.on("connected-players", (playersInfo) => {
    players.value = playersInfo
  })

  socket.on("initalize-game-client", ({ game, gameDetails }) => {
    initGame(game)
    currGameDetails.value = gameDetails
  })
  socket.on("curr-game-info", (gameDetails) => {
    currGameDetails.value = gameDetails
  })

}


export const connectToServer = () => {
  // TO CHANGE
  // socket = io('http://localhost:5000')
  socket = io(process.env.VUE_APP_ROOT_API!)
  socket.emit('register-user-on-server', getUsername())
  addOnEvents()
}

export const exitRoom = () => {
  messages.value = []
  currentRoom.value = NaN
  currGameDetails.value = {
    playersMoveOrder: [],
    gameState: [],
    gameStarted: false,
    minPlayers: NaN,
    maxPlayers: NaN,
    notInitiated: true,
    players: []
  }
  if (socket)
    socket.disconnect();
}


export const createNewRoom = (roomName?: string, roomPassword?: string) => {
  socket.emit("new-room", {
    givenName: roomName,
    givenPassword: roomPassword,
  })
}

export const setCurrentRoom = (id: number) => {
  currentRoom.value = id
}


export const joinRoom = (password?: string | null) => {
  socket.emit("join-room", {
    id: currentRoom.value,
    guessedPassword: password
  });
}

export const sendMessage = (message: string) => {
  socket.emit("send-chat-message", {
    message,
    id: currentRoom.value
  })
  messages.value.push(`You: ${message}`)
}

export const isAdmin = computed(() => {
  const room = rooms.value.filter(potentialRoom => potentialRoom.id == currentRoom.value)[0]
  if (room)
    return room.admin === getUsername()
  return false
})


export const roomDetails = computed(() => rooms.value.filter(potentialRoom => potentialRoom.id == currentRoom.value)[0])
export const getRooms = computed(() => rooms.value);
export const getMessages = computed(() => messages.value)
export const getPlayers = computed(() => players.value)
export const getCurrGameDetails = computed(() => currGameDetails.value)


// Games section


export const selectGameToPlay = (chosenGame: AvaliableGames) => {
  socket.emit('chosen-game', {
    selectedGame: chosenGame,
    id: currentRoom.value
  })
}

export const addPlayerToGame = (position: number) => {
  socket.emit('add-player-to-game', {
    roomId: currentRoom.value,
    position,
  })
}

export const makeMove = (move: string) => {
  // Do not use getUsername() instead use socket[id] on server
  socket.emit('make-move', {
    player: getUsername(),
    roomId: currentRoom.value,
    move
  })
}

export const startGame = () => {
  socket.emit('start-game-in-room', {
    roomId: currentRoom.value
  })
}

export const endGame = () => {
  socket.emit('end-game', {
    roomId: currentRoom.value
  })
}