import * as Crypto from 'expo-crypto';

/**
 * PKCE (Proof Key for Code Exchange) 유틸리티
 * RFC 7636 준수
 */

/**
 * URL-safe base64 인코딩
 * base64 -> base64url 변환 (+ -> -, / -> _, = 제거)
 */
function base64UrlEncode(input: Uint8Array): string {
  // ArrayBuffer를 base64로 변환
  const base64 = btoa(String.fromCharCode(...input));
  // base64url로 변환
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * 랜덤 code_verifier 생성
 * 43-128자의 URL-safe 문자열
 */
export async function generateCodeVerifier(): Promise<string> {
  // 32바이트 랜덤 데이터 생성 (base64url 인코딩 후 약 43자)
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return base64UrlEncode(randomBytes);
}

/**
 * code_verifier로부터 code_challenge 생성 (S256 방식)
 * SHA256(code_verifier)를 base64url 인코딩
 */
export async function generateCodeChallenge(
  codeVerifier: string
): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );

  // base64 -> base64url 변환
  return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * PKCE 키 쌍 생성
 */
export async function generatePKCEPair(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
  };
}












