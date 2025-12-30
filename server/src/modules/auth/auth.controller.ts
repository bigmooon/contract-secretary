import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators';
import {
  AuthResponseDto,
  LoginDto,
  MessageResponseDto,
  NaverTokenDto,
  RefreshTokenDto,
  RegisterDto,
  TokenResponseDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

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

  @Post('naver/token')
  @Public()
  @ApiOperation({
    summary: '네이버 OAuth 코드로 로그인 (모바일 앱용)',
    description:
      '클라이언트가 네이버에서 직접 받은 authorization code를 사용하여 로그인합니다. 세션이 필요 없어 모바일 앱에 적합합니다.',
  })
  @ApiBody({ type: NaverTokenDto })
  @ApiResponse({
    status: 200,
    description: '네이버 로그인이 완료되었습니다.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '네이버 인증에 실패했습니다.',
    type: MessageResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async naverTokenLogin(
    @Body() naverTokenDto: NaverTokenDto,
  ): Promise<AuthResponseDto> {
    this.logger.log('naverTokenLogin called', {
      codeLength: naverTokenDto.code.length,
      stateLength: naverTokenDto.state.length,
    });
    return this.authService.naverLoginWithCode(
      naverTokenDto.code,
      naverTokenDto.state,
    );
  }

  @Get('naver/mobile-callback')
  @Public()
  @ApiOperation({
    summary: '네이버 OAuth 콜백 (모바일 앱용)',
    description:
      '네이버 로그인 후 이 엔드포인트가 콜백을 받아서 앱의 딥링크로 리다이렉트합니다.',
  })
  @ApiQuery({ name: 'code', required: true, description: '네이버 인증 코드' })
  @ApiQuery({ name: 'state', required: true, description: 'CSRF 방지용 state' })
  @ApiResponse({
    status: 302,
    description: '앱의 딥링크로 리다이렉트됩니다.',
  })
  async naverMobileCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log('naverMobileCallback called', {
      hasCode: !!code,
      hasState: !!state,
      hasError: !!error,
    });

    // state 파싱: {originalState}|{base64EncodedAppCallbackUrl}
    let originalState = state;
    let appCallbackUrl = 'contractsecretary://auth/callback'; // 기본값

    if (state && state.includes('|')) {
      const [statePart, encodedCallback] = state.split('|');
      originalState = statePart;

      try {
        // Base64 디코딩하여 앱 콜백 URL 추출
        appCallbackUrl = Buffer.from(encodedCallback, 'base64').toString(
          'utf-8',
        );
        this.logger.log('Decoded app callback URL', { appCallbackUrl });
      } catch (decodeError) {
        this.logger.warn('Failed to decode app callback URL, using default', {
          error: decodeError,
        });
      }
    }

    // 에러가 있는 경우
    if (error) {
      this.logger.error('Naver OAuth error', { error, errorDescription });
      const redirectUrl = new URL(appCallbackUrl);
      redirectUrl.searchParams.set('error', error);
      if (errorDescription) {
        redirectUrl.searchParams.set('error_description', errorDescription);
      }
      res.redirect(redirectUrl.toString());
      return;
    }

    // 성공: code와 원본 state를 앱으로 전달
    const redirectUrl = new URL(appCallbackUrl);
    redirectUrl.searchParams.set('code', code);
    redirectUrl.searchParams.set('state', originalState);

    this.logger.log('Redirecting to app', {
      redirectUrl: redirectUrl.toString(),
    });
    res.redirect(redirectUrl.toString());
  }
}
