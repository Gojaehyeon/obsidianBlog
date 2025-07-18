#!/usr/bin/env node
// index.js
// 옵시디언 블로그 생성기 메인 실행 파일

import BlogWatcher from './blog-watcher.js';
import BlogGenerator from './blog-generator.js';

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'watch':
      // 파일 감시 모드
      const watcher = new BlogWatcher();
      await watcher.start();
      break;

    case 'generate':
      // 한 번만 생성 모드
      const generator = new BlogGenerator();
      const success = await generator.generate();
      process.exit(success ? 0 : 1);
      break;

    default:
      console.log(`
🚀 옵시디언 블로그 생성기

사용법:
  node index.js generate  # 블로그를 한 번 생성
  node index.js watch     # 파일 변경을 감시하며 자동 생성

예시:
  npm run generate
  npm run watch
      `);
      process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ 실행 오류:', error.message);
  process.exit(1);
}); 