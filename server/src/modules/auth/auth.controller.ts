import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators';
import {
  AuthResponseDto,
  LoginDto,
  MessageResponseDto,
  NaverUserPayload,
  RefreshTokenDto,
  RegisterDto,
  TokenExchangeDto,
  TokenResponseDto,
} from './dto';
import { NaverAuthGuard } from './guards';

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    codeChallenge?: string;
  }
}

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
    status: 400,
    description: '올바르지 않은 요청입니다.',
    type: MessageResponseDto,
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
    status: 400,
    description: '올바르지 않은 요청입니다.',
    type: MessageResponseDto,
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
  @ApiResponse({
    status: 400,
    description: '올바르지 않은 요청입니다.',
    type: MessageResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<MessageResponseDto> {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { message: '로그아웃이 완료되었습니다.' };
  }

  @Get('naver')
  @Public()
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: '네이버 로그인 페이지로 리다이렉트 (PKCE 지원)' })
  @ApiQuery({
    name: 'code_challenge',
    required: false,
    description: 'PKCE code_challenge (SHA256 해시, base64url 인코딩)',
  })
  @ApiResponse({
    status: 302,
    description: '네이버 로그인 페이지로 리다이렉트됩니다.',
  })
  async naverLogin(
    @Req() req: Request,
    @Query('code_challenge') codeChallenge?: string,
  ): Promise<void> {
    // store code_challenge in session for PKCE flow
    if (codeChallenge && req.session) {
      req.session.codeChallenge = codeChallenge;
    }
    // the NaverAuthGuard will redirect to Naver login page
  }

  @Get('naver/callback')
  @Public()
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: '네이버 OAuth 콜백 처리 (PKCE 지원)' })
  @ApiResponse({
    status: 302,
    description:
      '인증 코드와 함께 클라이언트 콜백 URL로 리다이렉트됩니다 (PKCE).',
  })
  @ApiResponse({
    status: 200,
    description: '네이버 로그인이 완료되었습니다 (웹/테스트용).',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '네이버 인증에 실패했습니다.',
    type: MessageResponseDto,
  })
  async naverCallback(
    @Req() req: Request & { user: NaverUserPayload },
    @Res() res: Response,
  ): Promise<void> {
    const clientCallbackUrl = process.env.CLIENT_CALLBACK_URL;
    const codeChallenge = req.session?.codeChallenge;

    // clear code challenge from session after use
    if (req.session) {
      delete req.session.codeChallenge;
    }

    // pkce flow: return authorization code instead of tokens
    if (clientCallbackUrl && codeChallenge) {
      const authCode = await this.authService.naverLoginWithPKCE(
        req.user,
        codeChallenge,
      );

      const redirectUrl = new URL(clientCallbackUrl);
      redirectUrl.searchParams.set('code', authCode);
      res.redirect(redirectUrl.toString());
      return;
    }

    // non-pkce flow for web/api testing only
    // WARNING: This should only be used in development/testing
    const authResponse = await this.authService.naverLogin(req.user);

    if (clientCallbackUrl) {
      // legacy flow (not recommended for production mobile apps)
      const redirectUrl = new URL(clientCallbackUrl);
      redirectUrl.searchParams.set('accessToken', authResponse.accessToken);
      redirectUrl.searchParams.set('refreshToken', authResponse.refreshToken);
      redirectUrl.searchParams.set('userId', authResponse.user.id);
      res.redirect(redirectUrl.toString());
    } else {
      // for web or api testing, return json response
      res.json(authResponse);
    }
  }

  @Post('token')
  @Public()
  @ApiOperation({ summary: 'PKCE 인증 코드를 토큰으로 교환' })
  @ApiBody({ type: TokenExchangeDto })
  @ApiResponse({
    status: 200,
    description: '토큰 교환이 완료되었습니다.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '올바르지 않은 요청입니다.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '유효하지 않은 인증 코드 또는 code_verifier입니다.',
    type: MessageResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async exchangeToken(
    @Body() tokenExchangeDto: TokenExchangeDto,
  ): Promise<AuthResponseDto> {
    return this.authService.exchangeCodeForTokens(
      tokenExchangeDto.code,
      tokenExchangeDto.codeVerifier,
    );
  }
}
