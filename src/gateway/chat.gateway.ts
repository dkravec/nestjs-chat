import { OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';
import { Message, Connection } from '../types/types';
// @WebSocketGateway({
//     cors: {
//         origin: "blank"
//     }
// })

const messages: Message[] = [];

@WebSocketGateway({
  namespace: 'chat', // connects to /chat
})
//  OnModuleInit, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
export class ChatGateway implements OnModuleInit {
  @WebSocketServer() //io: Namespace;
  server: Server;
  connections: any = {};
  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
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

  @SubscribeMessage('userLogin')
  onUserLogin(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    // console.log(this.server.sockets.server);
    // if (!body.userId) this.server.to()
    messages.push(body);
    console.log(messages);
    /*
      {
        "id" : 1,
        "content" : "This is a test",
        "user_id" : 2,
        "user_email" : "test@tester.com"
      }
    */
    this.connections[`${body.user_email}`] = {
      socket_id: client.id,
      user_id: body.user_id,
    };
    console.log(this.connections);
    //  Connection = {

    // };
    this.server.emit('onMessage', {
      msg: 'new message',
      content: body,
    });
  }
}
