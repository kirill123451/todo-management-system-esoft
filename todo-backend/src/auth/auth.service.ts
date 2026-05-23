import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async login(loginDto:any ) {
        const user = await this.usersService.findByLogin(loginDto.login)
        if(!user) throw new UnauthorizedException('Неверный логин или пароль')
        
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)
        if(!isPasswordValid) throw new UnauthorizedException('Неверный логин или пароль')

        const payload = {sub:user.id, login:user.login}
        return {
            access_token: this.jwtService.sign(payload),    
            user:{
                id:user.id,
                login:user.login,
                firstName:user.firstName,
                lastName:user.lastName,
                managerId:user.managerId
            }
        }
    }
}
