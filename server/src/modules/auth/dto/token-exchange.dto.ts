import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TokenExchangeDto {
  @ApiProperty({
    description: 'OAuth 콜백에서 받은 인증 코드',
    example: 'abc123def456...',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'PKCE code_verifier (43-128자 URL-safe 문자열)',
    example: 'random_code_verifier',
  })
  @IsString()
  @IsNotEmpty()
  @Length(43, 128)
  codeVerifier: string;
}
