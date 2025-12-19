import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * AES-256-GCM encryption service
 * - key rotation supported (ENCRYPTION_KEY, ENCRYPTION_KEY_PREVIOUS)
 * - IV is attached to the ciphertext
 * - format: base64(iv[12] + authTag[16] + ciphertext)
 */
@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 12;
  private readonly authTagLength = 16;

  private primaryKey: Buffer | null = null;
  private previousKey: Buffer | null = null;

  onModuleInit() {
    this.loadKeys();
  }

  private loadKeys(): void {
    const primaryKeyHex = process.env.ENCRYPTION_KEY;
    const previousKeyHex = process.env.ENCRYPTION_KEY_PREVIOUS;

    if (!primaryKeyHex) {
      this.logger.warn(
        'ENCRYPTION_KEY not set. Token encryption will be disabled.',
      );
      return;
    }

    try {
      this.primaryKey = Buffer.from(primaryKeyHex, 'hex');
      if (this.primaryKey.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
      }
    } catch (error) {
      this.logger.error('Failed to load ENCRYPTION_KEY:', error);
      this.primaryKey = null;
      return;
    }

    if (previousKeyHex) {
      try {
        this.previousKey = Buffer.from(previousKeyHex, 'hex');
        if (this.previousKey.length !== 32) {
          this.logger.warn(
            'ENCRYPTION_KEY_PREVIOUS must be 32 bytes. Ignoring.',
          );
          this.previousKey = null;
        } else {
          this.logger.log('Key rotation enabled with previous key');
        }
      } catch {
        this.logger.warn('Failed to load ENCRYPTION_KEY_PREVIOUS. Ignoring.');
        this.previousKey = null;
      }
    }
  }

  /**
   * check if encryption is enabled
   */
  isEnabled(): boolean {
    return this.primaryKey !== null;
  }

  /**
   * encrypt plaintext
   * @param plaintext plaintext to encrypt
   * @returns base64 encoded ciphertext (iv + authTag + ciphertext)
   */
  encrypt(plaintext: string): string {
    if (!this.primaryKey) {
      // if encryption key is not set, return plaintext (backward compatibility)
      return plaintext;
    }

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.primaryKey, iv, {
      authTagLength: this.authTagLength,
    });

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // combine iv + authTag + ciphertext
    const combined = Buffer.concat([iv, authTag, encrypted]);
    return combined.toString('base64');
  }

  /**
   * decrypt ciphertext
   * @param encrypted base64 encoded ciphertext
   * @returns decrypted plaintext
   * @throws error if decryption fails
   */
  decrypt(encrypted: string): string {
    if (!this.primaryKey) {
      // if encryption key is not set, return plaintext (backward compatibility)
      return encrypted;
    }

    // check if encrypted data (base64 format and minimum length)
    if (!this.isEncrypted(encrypted)) {
      // if not encrypted, return plaintext (backward compatibility)
      return encrypted;
    }

    // try to decrypt with current key
    try {
      return this.decryptWithKey(encrypted, this.primaryKey);
    } catch {
      // if current key fails, try with previous key
      if (this.previousKey) {
        try {
          return this.decryptWithKey(encrypted, this.previousKey);
        } catch {
          // if previous key fails, return plaintext (backward compatibility)
        }
      }
      // if both keys fail, return plaintext (backward compatibility)
      this.logger.warn('Decryption failed, returning as plaintext');
      return encrypted;
    }
  }

  /**
   * check if given string is encrypted data
   */
  private isEncrypted(data: string): boolean {
    // check if base64 format
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Regex.test(data)) {
      return false;
    }

    // check if minimum length (iv[12] + authTag[16] + minimum 1 byte)
    try {
      const buffer = Buffer.from(data, 'base64');
      return buffer.length >= this.ivLength + this.authTagLength + 1;
    } catch {
      return false;
    }
  }

  /**
   * decrypt with specific key
   */
  private decryptWithKey(encrypted: string, key: Buffer): string {
    const combined = Buffer.from(encrypted, 'base64');

    if (combined.length < this.ivLength + this.authTagLength + 1) {
      throw new Error('Invalid encrypted data: too short');
    }

    const iv = combined.subarray(0, this.ivLength);
    const authTag = combined.subarray(
      this.ivLength,
      this.ivLength + this.authTagLength,
    );
    const ciphertext = combined.subarray(this.ivLength + this.authTagLength);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv, {
      authTagLength: this.authTagLength,
    });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  /**
   * check if data is encrypted with current key (determine if re-encryption is needed)
   */
  needsReEncryption(encrypted: string): boolean {
    if (!this.primaryKey || !this.previousKey) {
      return false;
    }

    if (!this.isEncrypted(encrypted)) {
      // if plaintext, encryption is needed
      return true;
    }

    // try to decrypt with current key
    try {
      this.decryptWithKey(encrypted, this.primaryKey);
      return false; // if decryption with current key succeeds, re-encryption is not needed
    } catch {
      // if decryption with current key fails, it means the data is encrypted with previous key or plaintext
      return true;
    }
  }
}
