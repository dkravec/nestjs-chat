import { OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Namespace, Server } from 'socket.io';
import { Message, Connection } from '../types/types';
// @WebSocketGateway({
//     cors: {
//         origin: "blank"
//     }
// })

const messages: Message[] = [];
const conections: Connection = {
  socket_id: 'abc',
  user_id: 214,
};
// console.log(conections);

@WebSocketGateway()
//  OnModuleInit, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
export class ChatGateway implements OnModuleInit {
  @WebSocketServer() // io: Namespace;
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
    });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log('newMessage');
    messages.push(body);
    console.log(messages);

    this.server.emit('onMessage', {
      msg: 'new message',
      content: body,
    });
  }

  @SubscribeMessage('userLogin')
  onUserLogin(@MessageBody() body: any) {
    // console.log(this.server.sockets.server);
    // if (!body.userId) this.server.to()
    messages.push(body);
    console.log(messages);
    this.server.emit('onMessage', {
      msg: 'new message',
      content: body,
    });
  }
}
