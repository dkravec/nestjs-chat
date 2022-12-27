import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
} from '@nestjs/websockets';

@WebSocketGateway()
// @WebSocketGateway({
//     cors: {
//         origin: "blank"
//     }
// })
export class MyGateway {
  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log(body);
  }
}
