import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Lookup, WS_EVENTS } from '@containerly/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class UpdatesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      console.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  emitLookupUpdate(lookup: Lookup) {
    this.server.emit(WS_EVENTS.LOOKUP_UPDATE, {
      event: WS_EVENTS.LOOKUP_UPDATE,
      data: lookup,
    });

    if (lookup.status === 'COMPLETED') {
      this.server.emit(WS_EVENTS.LOOKUP_COMPLETE, {
        event: WS_EVENTS.LOOKUP_COMPLETE,
        data: lookup,
      });
    } else if (lookup.status === 'FAILED') {
      this.server.emit(WS_EVENTS.LOOKUP_ERROR, {
        event: WS_EVENTS.LOOKUP_ERROR,
        data: lookup,
      });
    }
  }
}




