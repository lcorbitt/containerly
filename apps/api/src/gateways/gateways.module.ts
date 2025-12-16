import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UpdatesGateway } from './updates.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-me',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  providers: [UpdatesGateway],
  exports: [UpdatesGateway],
})
export class GatewaysModule {}

