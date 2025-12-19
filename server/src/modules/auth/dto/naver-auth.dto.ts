import { ApiProperty } from '@nestjs/swagger';

export class NaverProfileDto {
  @ApiProperty({
    example: '1234567890',
    description: 'Naver ID',
  })
  id: string;

  @ApiProperty({
    example: '홍길동',
    description: 'Naver display name',
  })
  displayName: string;

  @ApiProperty({
    example: 'user@naver.com',
    description: 'Naver email',
    required: false,
  })
  email?: string;
}

export class NaverCallbackQueryDto {
  @ApiProperty({
    example: 'authorization_code',
    description: 'OAuth authorization code',
  })
  code: string;

  @ApiProperty({
    example: 'random_state_string',
    description: 'CSRF protection state',
  })
  state: string;
}

export class NaverUserPayload {
  accessToken: string;
  refreshToken: string;
  profile: NaverProfileDto;
}
