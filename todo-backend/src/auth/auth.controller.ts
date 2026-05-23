import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any, @Res() res: Response) {
    const data = await this.authService.login(loginDto)
    
    res.cookie('access_token', data.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    })

    return res.status(200).json({ user: data.user })
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token', { path: '/' })
    return res.status(200).json({ message: 'Успешный выход' })
  }
}
