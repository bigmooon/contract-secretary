export interface JwtPayload {
  sub: string; // user id
  email: string;
  provider: string;
  iat?: number; // issued at
  exp?: number; // expiration
}
