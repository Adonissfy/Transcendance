import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtTwoFactorGuard } from 'src/TwoFactorAuth/guards/jwt-two-factor.guard';
import { JwtAuthGuard } from 'src/Auth/guards/jwt-auth.guard';
import { UsersService } from 'src/Users/users.service';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
        private readonly userService: UsersService
    ) {}

    @Get('user/:id')
    @UseGuards(JwtTwoFactorGuard)
    async getUser(@Param() param: any, @Req() req, @Res() res) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const user = await this.chatService.getUser(param.id);
        let data = {};

        if (!user)
        {
            data = {
                uuid: param.id,
                username: "User deleted",
                trueUsername: "unknow",
                image: ""
            }
        } else
        {
            data = {
                uuid: user.uuid,
                username: user.username,
                trueUsername: user.trueUsername,
                image: user.image,
            }
        }
        res.json(data);
    }
}
