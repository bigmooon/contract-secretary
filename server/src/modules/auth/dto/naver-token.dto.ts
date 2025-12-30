import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NaverTokenDto {
  @ApiProperty({
    description: '네이버에서 받은 authorization code',
    example: 'abc123xyz',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: '네이버 OAuth state 파라미터 (CSRF 방지용)',
    example: 'random_state_string',
  })
  @IsString()
  @IsNotEmpty()
  state: string;
}
