import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'userId',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'email',
  })
  email: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
  })
  name: string;

  @ApiProperty({
    example: 'LOCAL',
    description: '인증 제공자 (LOCAL 또는 NAVER)',
    enum: ['LOCAL', 'NAVER'],
  })
  provider: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'abcdefghijklmnopqrstuvwxyz...',
    description: 'JWT 액세스 토큰',
  })
  accessToken: string;

  @ApiProperty({
    example: 'abcdefghijklmnopqrstuvwxyz...',
    description: 'JWT 리프레시 토큰',
  })
  refreshToken: string;

  @ApiProperty({
    description: '사용자 정보',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}

export class MessageResponseDto {
  @ApiProperty({
    example: '회원가입이 완료되었습니다.',
    description: '응답 메시지',
  })
  message: string;
}
