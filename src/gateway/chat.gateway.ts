import { OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message, Connection } from '../types/types';

// https://howtodoinjava.com/typescript/maps/
const messages: Message[] = [];
const connections: Map<string, Connection> = new Map<string, Connection>();

@WebSocketGateway({
  namespace: 'chat', // connects to /chat
  cors: {
    origin: 'http://localhost:4200',
  },
})
export class ChatGateway implements OnModuleInit {
  @WebSocketServer() server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      let clientEmail: string = null;
      console.log(`connection: ${socket.id}`);
      socket.on('userLogin', (body) => {
        if (body.userEmail) clientEmail = body.userEmail;
      });

      socket.on('disconnect', () => {
        if (!connections.has(clientEmail))
          return console.log('1 -- never properly connected');

        const userConnection = connections.get(clientEmail);

        if (userConnection.socketId != socket.id)
          return console.log('2 -- socket wasnt paired with provided email');

        console.log(connections);
        console.log(`disconnecting: ${socket.id}`);
        connections.delete(clientEmail);
        console.log(connections);
      });
    });
  }

  @SubscribeMessage('userLogin')
  onUserLogin(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    if (!body.userId) return console.log('1 --no userId');
    if (!body.userEmail) return console.log('2 -- no email');
    if (connections.has(body.userEmail))
      return console.log('3 -- user already in');

    console.log(`userLogin: ${client.id} - ${body.userEmail}`);
    messages.push(body);

    connections.set(body.userEmail, {
      socketId: client.id,
      userId: body.userId,
      userEmail: body.userEmail,
    });

    this.server.emit('onMessage', {
      msg: 'new message',
      content: body,
    });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    console.log(`Client ID: ${client.id}`);
    this.server.to(client.id).emit('sendback');

    console.log('newMessage');
    messages.push(body);
    console.log(messages);

    this.server.emit('onMessage', {
      msg: 'new message',
      content: body,
    });
  }

  @SubscribeMessage('clientMessage')
  onClientMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    if (!body.sendTo) return console.log('1 -- return 1');
    if (!connections.has(body.sendTo)) return console.log('2 -- missing');
    if (!body.content) return console.log('3 -- no content');
    const sendToClient = connections.get(body.sendTo).socketId;

    this.server.to(sendToClient).emit('clientMessage', {
      content: body.content,
      userEmail: body.userEmail,
      userTo: body.sendTo,
    });
  }
}

/* Tests
-- user 1
{   
    "id" : 1,
    "content" : "Test from user1 to user3",
    "userId" : 6337,
    "userEmail" : "tester1",
    "sendTo" : "tester3"
}

-- user 2
{   
    "id" : 2,
    "content" : "Test from user2 to user1",
    "userId" : 2637,
    "userEmail" : "tester2",
    "sendTo" : "tester1"
}
-- user 3
{   
    "id" : 3,
    "content" : "Test from user3 to user1",
    "userId" : 597,
    "userEmail" : "tester3",
    "sendTo" : "tester1"
}
*/
