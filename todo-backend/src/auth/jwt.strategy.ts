import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null
          if (req && req.cookies) {
            token = req.cookies['access_token']
          }
          return token
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: 'SUPER_SECRET_KEY_123', 
    })
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}

