import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Contract Secretary API가 정상적으로 실행 중입니다!';
  }
}
