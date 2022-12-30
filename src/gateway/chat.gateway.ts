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

  @SubscribeMessage('clientMessage')
  onClientMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    if (!body.sendTo) return console.log('return 1');

    if (!this.connections[`${body.sendTo}`]) return console.log('return 2');

    const sendToClient = this.connections[`${body.sendTo}`].socket_id;

    this.server.to(sendToClient).emit('clientMessage', {
      msg: 'this is a message',
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
    console.log(client);
  }
}

/* Tests
@userLogin - Tester 1
{
    "id" : 1,
    "user_id" : 1456,
    "user_email" : "tester1"
}

@userLogin - Tester 2
{   
    "id" : 2,
    "user_id" : 2637,
    "user_email" : "tester2"
}

@newMessage - Tester 1
{
    "id" : 1,
    "content" : "This is a message to 2",
    "sendTo" : "tester2"
}
@newMessage - Tester 1
{
    "id" : 2,
    "content" : "This is going back now to 1.",
    "sendTo" : "tester1"
}
*/
