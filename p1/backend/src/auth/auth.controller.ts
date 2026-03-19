import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Post('signup')
  async signup(@Body() body: { email: string; name: string; password: string }) {
    return this.authService.signup(body);
  }

  @Get('me')
  async me(@Headers('x-user-id') userId?: string) {
    return this.authService.me(userId ? Number(userId) : undefined);
  }
}

