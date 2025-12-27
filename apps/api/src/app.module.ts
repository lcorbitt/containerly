import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { LookupsModule } from './lookups/lookups.module';
import { JsoncargoModule } from './jsoncargo/jsoncargo.module';
import { QueueModule } from './queue/queue.module';
import { GatewaysModule } from './gateways/gateways.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Lookup, Organization } from '@containerly/db';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/containerly',
      entities: [User, Lookup, Organization],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 10,
      retryDelay: 3000,
      autoLoadEntities: true,
    }),
    AuthModule,
    LookupsModule,
    JsoncargoModule,
    QueueModule,
    GatewaysModule,
  ],
})
export class AppModule {}

