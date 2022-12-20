import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from './login/login.module';
import { UserModel } from './typeorm/user.entity';
import entities from './typeorm';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path/posix';
import { UsersService } from './users/users.service';
import { AppService } from './app.service';
import { JwtStrategy } from './login/jwt.strategy';
import { twoAuthModule } from './2auth/twoFactorAuthentication.module';
import { JwtTwoFactorStrategy } from './2auth/auth.strategy';
import { ChatModule } from './Chat/chat.module';
import { Channel } from './Chat/Entities/channel.entity';
import { RoomModule } from './Game/room.module';
import { AppGateway } from './app.gateway';
import { DM } from './Chat/Entities/dm.entity';
import { Room } from './Game/Entities/room.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, ScheduleModule.forRoot()],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [UserModel, Channel, Room, DM],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserModel, Channel, DM, Room]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src/uploads/avatar'),
    }),
    LoginModule,
    UsersModule,
    HttpModule,
    twoAuthModule,
    ChatModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [
    UsersService,
    AppService,
    JwtStrategy,
    JwtTwoFactorStrategy,
    AppGateway,
  ],
  //   exports: [AppService],
})
export class AppModule {}
