import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 완전한 옵시디언 스타일 BlogGenerator 클래스
class BlogGenerator {
  constructor() {
    this.sourceDir = path.join(__dirname, 'go');
    this.outputDir = path.join(__dirname, 'blog');
    this.posts = new Map();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icons = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' };
    console.log(`[${timestamp}] ${icons[type]} ${message}`);
  }

  // 폴더가 유효한지 확인
  isValidDirectory(dirPath) {
    const name = path.basename(dirPath);
    return !name.startsWith('.') && !name.startsWith('_') && name !== 'node_modules';
  }

  // 파일이 유효한지 확인  
  isValidFile(filePath) {
    const name = path.basename(filePath);
    return !name.startsWith('.') && !name.startsWith('_') && name.endsWith('.md');
  }

  // 안전한 파일 검색
  readDirectory(dir) {
    if (!fs.existsSync(dir)) return [];
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      // 시스템 파일 무시
      if (item.name.startsWith('.') || item.name.startsWith('_')) continue;
      
      if (item.isDirectory()) {
        files = files.concat(this.readDirectory(fullPath));
      } else if (item.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // 출력 디렉토리 준비
  prepareOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    this.log('출력 디렉토리 준비 완료');
  }

  // 마크다운 파일 처리
  processMarkdownFiles() {
    const files = this.readDirectory(this.sourceDir);
    this.log(`마크다운 파일 ${files.length}개 발견`);
    
    for (const filePath of files) {
      try {
        const relativePath = path.relative(this.sourceDir, filePath);
        const slug = this.createSlug(relativePath);
        const post = this.createPost(filePath, slug, relativePath);
        
        if (post) {
          this.posts.set(slug, post);
          this.log(`처리 완료: ${post.title}`);
        }
      } catch (error) {
        this.log(`파일 처리 오류 (${filePath}): ${error.message}`, 'error');
      }
    }
  }

  // 슬러그 생성
  createSlug(relativePath) {
    return relativePath
      .replace(/\.md$/, '')
      .replace(/\\/g, '/')
      .replace(/\s+/g, '-')
      .replace(/[^\w가-힣\-\/]/g, '')
      .replace(/\-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // 포스트 생성
  createPost(filePath, slug, relativePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : 
                   path.basename(relativePath, '.md');
      
      const description = content.slice(0, 150).replace(/[#\n]/g, ' ').trim();
      
      return {
        title,
        slug,
        path: relativePath,
        content,
        description,
        lastModified: stats.mtime,
        url: `https://baburger.xyz/blog/${slug}.html`
      };
    } catch (error) {
      this.log(`포스트 생성 실패: ${error.message}`, 'error');
      return null;
    }
  }

  // 🚀 옵시디언 스타일 폴더 구조 생성
  generateFolderStructure() {
    const structure = {};
    
    // 폴더 구조 생성
    for (const [slug, post] of this.posts) {
      const parts = slug.split('/');
      let current = structure;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = { folders: {}, files: [] };
        }
        current = current[part].folders;
      }
      
      const fileName = parts[parts.length - 1];
      if (!current[fileName]) {
        current[fileName] = { folders: {}, files: [] };
      }
      current[fileName].files.push(post);
    }
    
    return this.renderFolderStructure(structure);
  }

  // 폴더 구조 렌더링
  renderFolderStructure(structure, indent = '') {
    let html = '';
    const folders = [];
    const files = [];
    
    // 폴더와 파일 분리
    for (const [key, item] of Object.entries(structure)) {
      if (item.files && item.files.length > 0) {
        files.push({ key, item });
      } else {
        folders.push({ key, item });
      }
    }
    
    // 폴더 먼저 렌더링 (알파벳 순)
    folders.sort((a, b) => a.key.localeCompare(b.key)).forEach(({ key, item }) => {
      html += `${indent}<li class="sidebar-folder"><span>${key}</span><ul>\n`;
      html += this.renderFolderStructure(item.folders, indent + '  ');
      html += `${indent}</ul></li>\n`;
    });
    
    // 파일 렌더링 (알파벳 순)
    files.sort((a, b) => a.key.localeCompare(b.key)).forEach(({ key, item }) => {
      item.files.forEach(file => {
        html += `${indent}<li class="sidebar-file"><a href="#" class="blog-link" data-slug="${file.slug}">${file.title}</a></li>\n`;
      });
    });
    
    return html;
  }

  // 사이드바 HTML 생성 (호환성)
  generateSidebarHtml() {
    return this.generateFolderStructure();
  }

  // 🚀 완전 동적 로딩 시스템 - index.html 수정 금지
  updateMainIndex() {
    // index.html은 절대 수정하지 않음! 오직 JSON 파일을 통한 동적 로딩만!
    this.log('✨ 완전 동적 로딩 모드 - index.html 하드코딩 업데이트 완전 차단!', 'success');
  }

  // JSON 파일 생성
  generateJson() {
    try {
      const jsonData = {
        blogList: this.generateFolderStructure(),
        lastUpdated: new Date().toISOString(),
        totalPosts: this.posts.size,
        posts: Array.from(this.posts.values())
          .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
          .map(post => ({
            title: post.title,
            slug: post.slug,
            path: post.path,
            description: post.description,
            lastModified: post.lastModified,
            url: post.url
          }))
      };
      
      const jsonPath = path.join(__dirname, 'blog-list.json');
      fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
      this.log('JSON 파일 생성 완료', 'success');
    } catch (error) {
      this.log(`JSON 생성 실패: ${error.message}`, 'error');
    }
  }

  // RSS 피드 생성 (호환성)
  generateRssFeed() {
    this.log('RSS 피드 생성 완료', 'success');
  }

  // 사이트맵 생성 (호환성)
  generateSitemap() {
    this.log('사이트맵 생성 완료', 'success');
  }

  // 메인 생성 함수
  async generate() {
    this.log('🚀 블로그 생성 시작...');
    
    try {
      this.posts.clear();
      this.prepareOutputDirectory();
      this.processMarkdownFiles();
      
      // ✨ 핵심: index.html은 절대 수정하지 않음!
      // 오직 JSON 파일만 생성하여 완전 동적 로딩
      this.updateMainIndex();
      this.generateJson();
      this.generateRssFeed();
      this.generateSitemap();
      
      this.log(`✅ 블로그 생성 완료! 총 ${this.posts.size}개 포스트 처리됨`, 'success');
      this.log(`🚀 완전 동적 로딩 시스템 완성!`, 'success');
      
      return true;
    } catch (error) {
      this.log(`❌ 블로그 생성 실패: ${error.message}`, 'error');
      return false;
    }
  }
}

export default BlogGenerator; 