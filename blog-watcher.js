// blog-watcher.js
// 깔끔한 클래스 기반 파일 감시기

import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from './config.js';
import BlogGenerator from './blog-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BlogWatcher {
  constructor() {
    this.config = config;
    this.generator = new BlogGenerator();
    this.mdDir = path.resolve(__dirname, this.config.paths.markdown);
    this.watcher = null;
    this.regenerateTimeout = null;
  }

  // 로그 출력
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${emoji} ${message}`);

    // 서버 로그 파일에 기록
    try {
      const logMessage = `[${timestamp}] ${message}\n`;
      fs.appendFileSync(this.config.server.logFile, logMessage);
    } catch (error) {
      // 로그 파일 기록 실패는 무시
    }
  }

  // 감시 대상 파일인지 확인
  isWatchTarget(filePath) {
    const relativePath = path.relative(this.mdDir, filePath);
    const fileName = path.basename(filePath);
    
    // 마크다운 파일이거나 이미지 파일인 경우
    return this.generator.isMarkdownFile(fileName) || this.generator.isImageFile(fileName);
  }

  // 디바운싱이 적용된 재생성 함수
  scheduleRegeneration() {
    clearTimeout(this.regenerateTimeout);
    this.regenerateTimeout = setTimeout(async () => {
      this.log('🔄 블로그 재생성 중...');
      const success = await this.generator.generate();
      if (success) {
        this.log('✅ 변환 완료!', 'success');
      } else {
        this.log('❌ 변환 실패!', 'error');
      }
      this.log('👀 파일 변경 감시 중... (Ctrl+C로 종료)');
    }, this.config.server.watchDelay);
  }

  // 파일 변경 이벤트 처리
  handleFileEvent(eventType, filePath) {
    if (!this.isWatchTarget(filePath)) {
      return; // 감시 대상이 아닌 파일은 무시
    }

    const relativePath = path.relative(this.mdDir, filePath);
    
    switch (eventType) {
      case 'add':
        this.log(`📝 새 파일 추가: ${relativePath}`);
        break;
      case 'change':
        this.log(`✏️ 파일 수정: ${relativePath}`);
        break;
      case 'unlink':
        this.log(`🗑️ 파일 삭제: ${relativePath}`);
        break;
      case 'addDir':
        this.log(`📁 새 폴더 추가: ${relativePath}`);
        break;
      case 'unlinkDir':
        this.log(`🗂️ 폴더 삭제: ${relativePath}`);
        break;
      default:
        return; // 알 수 없는 이벤트는 무시
    }

    this.scheduleRegeneration();
  }

  // 감시 시작
  async start() {
    this.log('🚀 옵시디언 실시간 연동 시작...');
    this.log(`📁 감시 폴더: ${this.mdDir}`);
    this.log(`📄 출력 폴더: ${path.resolve(__dirname, this.config.paths.output)}`);

    // 마크다운 디렉토리 존재 확인
    if (!fs.existsSync(this.mdDir)) {
      this.log(`❌ 마크다운 폴더가 존재하지 않습니다: ${this.mdDir}`, 'error');
      process.exit(1);
    }

    // 초기 생성
    this.log('🔄 초기 변환 실행 중...');
    const success = await this.generator.generate();
    if (success) {
      this.log('✅ 초기 변환 완료!', 'success');
    } else {
      this.log('❌ 초기 변환 실패!', 'error');
    }

    // 파일 감시 설정
    this.watcher = chokidar.watch(this.mdDir, {
      ignored: [
        /(^|[\/\\])\../, // 숨김 파일/폴더
        '**/node_modules/**',
        '**/.git/**',
        `**/${this.config.paths.output}/**`, // 출력 폴더는 제외
        '**/*.html',
        '**/*.js',
        '**/*.css'
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      }
    });

    // 이벤트 리스너 등록
    this.watcher
      .on('add', (filePath) => this.handleFileEvent('add', filePath))
      .on('change', (filePath) => this.handleFileEvent('change', filePath))
      .on('unlink', (filePath) => this.handleFileEvent('unlink', filePath))
      .on('addDir', (filePath) => this.handleFileEvent('addDir', filePath))
      .on('unlinkDir', (filePath) => this.handleFileEvent('unlinkDir', filePath))
      .on('error', (error) => this.log(`❌ 감시 오류: ${error.message}`, 'error'));

    this.log('👀 파일 변경 감시 중... (Ctrl+C로 종료)');

    // 종료 처리 설정
    this.setupExitHandlers();
  }

  // 종료 처리 설정
  setupExitHandlers() {
    const gracefulShutdown = () => {
      this.log('\n🛑 감시 중지...');
      if (this.watcher) {
        this.watcher.close();
      }
      clearTimeout(this.regenerateTimeout);
      this.log('🔄 프로세스 종료');
      process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('exit', () => {
      this.log('🔄 프로세스 종료');
    });

    // 예상치 못한 오류 처리
    process.on('uncaughtException', (error) => {
      this.log(`❌ 예상치 못한 오류: ${error.message}`, 'error');
      this.log(`스택 트레이스: ${error.stack}`, 'error');
    });

    process.on('unhandledRejection', (reason) => {
      this.log(`❌ 처리되지 않은 Promise 거부: ${reason}`, 'error');
    });
  }

  // 감시 중지
  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    clearTimeout(this.regenerateTimeout);
    this.log('🛑 파일 감시 중지됨');
  }
}

export default BlogWatcher; 