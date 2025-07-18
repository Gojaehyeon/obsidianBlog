import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 최소한 안전한 BlogGenerator
class BlogGenerator {
  constructor() {
    this.sourceDir = path.join(__dirname, 'go');
    this.outputDir = path.join(__dirname, 'blog');
    this.posts = new Map();
    
    marked.setOptions({
      breaks: true,
      gfm: true
    });
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
  findMarkdownFiles(dir) {
    if (!fs.existsSync(dir) || !this.isValidDirectory(dir)) return [];
    
    let files = [];
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory() && this.isValidDirectory(fullPath)) {
          files = files.concat(this.findMarkdownFiles(fullPath));
        } else if (item.isFile() && this.isValidFile(fullPath)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.log(`폴더 읽기 오류 (${dir}): ${error.message}`, 'warn');
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
    const files = this.findMarkdownFiles(this.sourceDir);
    this.log(`마크다운 파일 ${files.length}개 발견`);
    
    for (const filePath of files) {
      try {
        const relativePath = path.relative(this.sourceDir, filePath);
        const slug = this.createSlug(relativePath);
        const post = this.createPost(filePath, slug, relativePath);
        
        if (post) {
          this.posts.set(slug, post);
          this.log(`처리 완료: ${slug}`);
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
      
      const description = content.slice(0, 200).replace(/[#\n]/g, ' ').trim();
      
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

  // 사이드바 HTML 생성
  generateSidebarHtml() {
    let html = '';
    
    for (const [slug, post] of this.posts) {
      html += `<li class="sidebar-file"><a href="#" class="blog-link" data-slug="${slug}">${post.title}</a></li>\n`;
    }
    
    return html;
  }

  // JSON 파일 생성
  generateJson() {
    try {
      const jsonData = {
        blogList: this.generateSidebarHtml(),
        lastUpdated: new Date().toISOString(),
        totalPosts: this.posts.size,
        posts: Array.from(this.posts.values()).map(post => ({
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

  // 메인 생성 함수
  async generate() {
    this.log('🚀 블로그 생성 시작...');
    
    try {
      this.posts.clear();
      this.prepareOutputDirectory();
      this.processMarkdownFiles();
      this.generateJson();
      
      this.log(`✅ 블로그 생성 완료! 총 ${this.posts.size}개 포스트 처리됨`, 'success');
      return true;
    } catch (error) {
      this.log(`❌ 블로그 생성 실패: ${error.message}`, 'error');
      return false;
    }
  }
}

export default BlogGenerator; 