import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto, AuthResponse } from '@containerly/common';
import { JwtAuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<AuthResponse> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Post('google')
  async googleAuth(@Body() body: { email: string; name?: string }) {
    return this.authService.googleAuth(body.email, body.name);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    const user = await this.authService.validateUser(req.user.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      orgId: user.orgId,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      organization: user.organization
        ? {
            id: user.organization.id,
            name: user.organization.name,
            createdAt: user.organization.createdAt,
            updatedAt: user.organization.updatedAt,
          }
        : null,
    };
  }
}

