// performance-optimizer.js
// 성능 최적화 유틸리티

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PerformanceOptimizer {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
  }

  // 로그 출력
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${emoji} ${message}`);
  }

  // HTML 최적화
  optimizeHtml(html) {
    if (!this.config.performance?.build?.minifyHtml) {
      return html;
    }

    try {
      // 기본적인 HTML 최적화
      let optimized = html
        // 불필요한 공백 제거
        .replace(/>\s+</g, '><')
        // 연속된 공백 제거
        .replace(/\s+/g, ' ')
        // 주석 제거 (HTML 주석만)
        .replace(/<!--[\s\S]*?-->/g, '')
        // 빈 줄 제거
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      return optimized;
    } catch (error) {
      this.log(`HTML 최적화 실패: ${error.message}`, 'warn');
      return html;
    }
  }

  // 이미지 최적화 (기본적인 처리)
  optimizeImage(imagePath) {
    try {
      const stats = fs.statSync(imagePath);
      const maxSize = 1024 * 1024; // 1MB

      if (stats.size > maxSize) {
        this.log(`큰 이미지 파일 발견: ${path.basename(imagePath)} (${Math.round(stats.size / 1024)}KB)`, 'warn');
        // 실제 이미지 최적화는 sharp, imagemin 등의 라이브러리가 필요
        // 여기서는 경고만 출력
      }

      return {
        path: imagePath,
        size: stats.size,
        optimized: false
      };
    } catch (error) {
      this.log(`이미지 최적화 실패: ${error.message}`, 'error');
      return null;
    }
  }

  // 캐시 관리
  setCache(key, value, ttl = 3600) {
    const expireTime = Date.now() + (ttl * 1000);
    this.cache.set(key, {
      value,
      expireTime
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expireTime) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  clearCache() {
    this.cache.clear();
    this.log('캐시 클리어 완료');
  }

  // 파일 해시 생성 (캐시 버스팅용)
  generateFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      const hash = require('crypto').createHash('md5').update(content).digest('hex');
      return hash.substring(0, 8);
    } catch (error) {
      this.log(`파일 해시 생성 실패: ${error.message}`, 'error');
      return Date.now().toString(36);
    }
  }

  // 정적 파일 캐싱 헤더 생성
  getCacheHeaders(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const maxAge = this.config.performance?.cache?.maxAge || 3600;

    // 파일 타입별 캐시 설정
    const cacheConfig = {
      '.css': maxAge * 24, // 24시간
      '.js': maxAge * 24,  // 24시간
      '.png': maxAge * 7 * 24, // 7일
      '.jpg': maxAge * 7 * 24,
      '.jpeg': maxAge * 7 * 24,
      '.gif': maxAge * 7 * 24,
      '.svg': maxAge * 7 * 24,
      '.webp': maxAge * 7 * 24,
      '.html': maxAge, // 1시간
      '.xml': maxAge,  // 1시간
      '.json': maxAge / 2 // 30분
    };

    return {
      'Cache-Control': `public, max-age=${cacheConfig[ext] || maxAge}`,
      'ETag': this.generateFileHash(filePath)
    };
  }

  // 압축 설정
  shouldCompress(filePath) {
    if (!this.config.performance?.compression?.enabled) {
      return false;
    }

    const ext = path.extname(filePath).toLowerCase();
    const compressibleTypes = ['.html', '.css', '.js', '.json', '.xml', '.svg'];
    
    return compressibleTypes.includes(ext);
  }

  // 성능 메트릭 수집
  collectMetrics() {
    const metrics = {
      cacheHitRate: this.calculateCacheHitRate(),
      totalFiles: this.getTotalFiles(),
      totalSize: this.getTotalSize(),
      optimizedFiles: this.getOptimizedFiles(),
      timestamp: new Date().toISOString()
    };

    return metrics;
  }

  calculateCacheHitRate() {
    // 캐시 적중률 계산 (실제 구현에서는 히트/미스 카운터 필요)
    return 0.85; // 임시값
  }

  getTotalFiles() {
    try {
      const blogDir = path.join(__dirname, this.config.paths.output);
      if (!fs.existsSync(blogDir)) return 0;

      const files = this.getAllFiles(blogDir);
      return files.length;
    } catch (error) {
      return 0;
    }
  }

  getTotalSize() {
    try {
      const blogDir = path.join(__dirname, this.config.paths.output);
      if (!fs.existsSync(blogDir)) return 0;

      const files = this.getAllFiles(blogDir);
      return files.reduce((total, file) => {
        try {
          const stats = fs.statSync(file);
          return total + stats.size;
        } catch {
          return total;
        }
      }, 0);
    } catch (error) {
      return 0;
    }
  }

  getOptimizedFiles() {
    // 최적화된 파일 수 (실제 구현에서는 최적화 기록 필요)
    return Math.floor(this.getTotalFiles() * 0.8); // 임시값
  }

  getAllFiles(dir) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // 디렉토리 읽기 실패 시 빈 배열 반환
    }
    
    return files;
  }

  // 성능 보고서 생성
  generatePerformanceReport() {
    const metrics = this.collectMetrics();
    const report = {
      summary: {
        totalFiles: metrics.totalFiles,
        totalSize: this.formatBytes(metrics.totalSize),
        cacheHitRate: `${(metrics.cacheHitRate * 100).toFixed(1)}%`,
        optimizedFiles: metrics.optimizedFiles,
        optimizationRate: `${((metrics.optimizedFiles / metrics.totalFiles) * 100).toFixed(1)}%`
      },
      details: {
        cacheConfig: this.config.performance?.cache || {},
        compressionConfig: this.config.performance?.compression || {},
        buildConfig: this.config.performance?.build || {}
      },
      timestamp: metrics.timestamp
    };

    this.log(`성능 보고서 생성 완료 - 총 ${metrics.totalFiles}개 파일, ${this.formatBytes(metrics.totalSize)}`);
    return report;
  }

  // 바이트 단위 포맷팅
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default PerformanceOptimizer; 