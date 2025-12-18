import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators';
import {
  AuthResponseDto,
  LoginDto,
  MessageResponseDto,
  RefreshTokenDto,
  RegisterDto,
  TokenResponseDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: '자체 회원가입' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '회원가입이 완료되었습니다.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '올바르지 않은 요청입니다.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일입니다.',
    type: MessageResponseDto,
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: '로그인(local)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '로그인이 완료되었습니다.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 실패했습니다.',
    type: MessageResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: '토큰이 갱신되었습니다.',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '유효하지 않은 리프레시 토큰입니다.',
    type: MessageResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @Public()
  @ApiOperation({ summary: '로그아웃' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: '로그아웃이 완료되었습니다.',
    type: MessageResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<MessageResponseDto> {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { message: '로그아웃이 완료되었습니다.' };
  }
}
