import { PORT } from '@repo/backend-common/config';
import { URLSearchParams } from 'url';
import { WebSocket, WebSocketServer } from 'ws';
import { checkAuthentication } from './lib';

const Rooms: Map<string, Set<WebSocket>> = new Map();
const Clients: Map<WebSocket, string> = new Map();

//setting 3 rooms as demo

Rooms.set('NSFW Room', new Set());
Rooms.set('Nerd Room', new Set());
Rooms.set('SFW Room', new Set());

const permanentRooms = ['NSFW Room', 'Nerd Room', 'SFW Room'];
let clientCounter = 0;

const wss = new WebSocketServer({ port: Number(PORT) });
console.log('WebSocket Server is running on port', PORT);
wss.on('connection', (socket, request) => {
  const url = request.url!;

  const token = new URLSearchParams(url.split('?')[1]).get('token');

  if (!token) {
    socket.send(
      JSON.stringify({
        status: false,
        message: 'No token provided',
      })
    );
    socket.close();
    return;
  }

  const userId = checkAuthentication(token);

  if (!userId) {
    socket.send(
      JSON.stringify({
        status: false,
        message: 'Unauthorized',
      })
    );

    socket.close();
    return;
  }

  const clientId = `client_${++clientCounter}`;
  Clients.set(socket, clientId);
  socket.send('Connection to server. Welcome ' + clientId);

  console.log('Client' + clientId + ' connected');
  socket.on('message', (message) => {
    console.log(message.toString());

    try {
      const messageFromClient = JSON.parse(message.toString());

      if (messageFromClient?.type === 'join_room') {
        if (
          messageFromClient.payload?.room &&
          Rooms.has(messageFromClient.payload.room)
        ) {
          if (!Rooms.get(messageFromClient.payload.room)?.has(socket)) {
            Rooms.get(messageFromClient.payload.room)?.add(socket);
            Rooms.get(messageFromClient.payload.room)?.forEach((soc) =>
              soc.send(`${clientId} has joined the room`)
            );
            socket.send(
              JSON.stringify({
                status: 'true',
                message: `Connected to room ${messageFromClient.payload.room}`,
              })
            );
          } else {
            console.log('Already connected');
            // socket.send(clientId + ' is already connected to the group');     //Not necessary
          }
        } else {
          socket.send(
            JSON.stringify({
              status: false,
              message: `Room with the name ${messageFromClient.payload.room} does not exists. Create a new Room`,
            })
          );
        }
      }

      if (messageFromClient?.type === 'leave_room') {
        if (
          messageFromClient.payload?.room &&
          Rooms.has(messageFromClient.payload.room)
        ) {
          if (Rooms.get(messageFromClient.payload.room)?.has(socket)) {
            Rooms.get(messageFromClient.payload.room)?.delete(socket);
            Rooms.get(messageFromClient.payload.room)?.forEach((soc) =>
              soc.send(`${clientId} has left the room`)
            );
            socket.send(
              JSON.stringify({
                status: 'true',
                message: `Successfully left room ${messageFromClient.payload.room}`,
              })
            );
          } else {
            console.log('Not connected to the room');
          }
        } else {
          socket.send(
            JSON.stringify({
              status: false,
              message: `Room with the name ${messageFromClient.payload.room} does not exists. Create a new Room`,
            })
          );
        }
      }

      if (messageFromClient?.type === 'create_room') {
        if (
          messageFromClient.payload?.room &&
          Rooms.has(messageFromClient.payload.room)
        ) {
          Rooms.get(messageFromClient.payload.room)?.add(socket);
          socket.send(
            JSON.stringify({
              status: 'false',
              message: `Room with name ${messageFromClient.payload.room} already exists`,
            })
          );
        } else {
          Rooms.set(messageFromClient.payload.room, new Set());
          socket.send(
            JSON.stringify({
              status: true,
              message: `Successfully created Room ${messageFromClient.payload.room}`,
            })
          );
        }
      }

      if (messageFromClient?.type === 'chat') {
        const socketsToBroadcast = Rooms.get(messageFromClient.payload.room);

        if (socketsToBroadcast?.has(socket)) {
          const client = Clients.get(socket);
          socketsToBroadcast?.forEach((socket) => {
            socket.send(
              'Sent by ' + client + ' : ' + messageFromClient?.payload?.message
            );
          });
        }
      }
    } catch (err: any) {
      console.error(err.message);
      socket.send(
        JSON.stringify({
          status: false,
          message: 'Invalid message',
        })
      );
    }

    socket.on('close', () => {
      console.log('Client ' + clientId + ' has disconnected');

      Clients.delete(socket);

      Rooms.forEach((clients, room) => {
        clients?.delete(socket);
        clients.forEach((soc) => soc.send(clientId + ' has left the room'));
        if (clients.size == 0 && !permanentRooms.includes(room))
          Rooms.delete(room);
      });
    });

    socket.on('error', (err) => {
      console.error(err);
      socket.send(
        JSON.stringify({
          status: false,
          message: 'Invalid message',
        })
      );
    });
  });
});
