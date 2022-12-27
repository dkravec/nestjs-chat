import { OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway()
// @WebSocketGateway({
//     cors: {
//         origin: "blank"
//     }
// })
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
    });
    // this.server.on('newMessage', (body) => {
    //   console.log(body);
    // });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    // console.log(this.server.sockets.);
    console.log('newMessage' + body);
    this.server.emit('onMessage', {
      msg: 'new message',
      content: body,
    });
  }
}
