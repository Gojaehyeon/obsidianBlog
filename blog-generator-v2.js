import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 완전 새로운 BlogGenerator v2.0 - 하드코딩 금지!
class BlogGenerator {
  constructor() {
    this.sourceDir = path.join(__dirname, 'go');
    this.outputDir = path.join(__dirname, 'blog');
    this.posts = new Map();
    this.optimizer = new PerformanceOptimizer();
    
    // Marked 설정
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  // 로그 출력
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warn: '⚠️',
      error: '❌'
    };
    console.log(`[${timestamp}] ${icons[type]} ${message}`);
  }

  // 출력 디렉토리 준비
  prepareOutputDirectory() {
    if (fs.existsSync(this.outputDir)) {
      // 기존 HTML 파일만 제거 (이미지는 유지)
      const files = fs.readdirSync(this.outputDir, { withFileTypes: true });
      files.forEach(file => {
        if (file.isFile() && file.name.endsWith('.html')) {
          fs.unlinkSync(path.join(this.outputDir, file.name));
        } else if (file.isDirectory()) {
          this.removeHtmlFilesRecursively(path.join(this.outputDir, file.name));
        }
      });
    } else {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    this.log('기존 HTML 파일 정리 완료');
  }

  // HTML 파일만 재귀적으로 제거
  removeHtmlFilesRecursively(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      if (file.isFile() && file.name.endsWith('.html')) {
        fs.unlinkSync(fullPath);
      } else if (file.isDirectory()) {
        this.removeHtmlFilesRecursively(fullPath);
      }
    });
  }

  // 이미지 파일 복사
  copyImages() {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    const images = this.findFilesRecursively(this.sourceDir, imageExtensions);
    
    this.log(`이미지 파일 ${images.length}개 발견`);
    
    images.forEach(imagePath => {
      const relativePath = path.relative(this.sourceDir, imagePath);
      const outputPath = path.join(this.outputDir, relativePath);
      
      // 디렉토리 생성
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      
      // 이미지 복사
      fs.copyFileSync(imagePath, outputPath);
      this.log(`이미지 복사: ${relativePath}`);
    });
  }

  // 파일 재귀 검색
  findFilesRecursively(dir, extensions) {
    if (!fs.existsSync(dir)) return [];
    
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files = files.concat(this.findFilesRecursively(fullPath, extensions));
      } else if (extensions.some(ext => item.name.toLowerCase().endsWith(ext))) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  // 마크다운 파일 처리
  processMarkdownFiles() {
    const markdownFiles = this.findFilesRecursively(this.sourceDir, ['.md']);
    this.log(`마크다운 파일 ${markdownFiles.length}개 발견`);
    
    markdownFiles.forEach(filePath => {
      const relativePath = path.relative(this.sourceDir, filePath);
      const slug = this.createSlug(relativePath);
      const post = this.createPostFromFile(filePath, slug, relativePath);
      
      if (post) {
        this.posts.set(slug, post);
        this.generateHtmlFile(post);
        this.log(`HTML 생성: ${post.slug}.html`);
      }
    });
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

  // 포스트 객체 생성
  createPostFromFile(filePath, slug, relativePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      
      // 제목 추출 (첫 번째 # 헤더 또는 파일명)
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : 
                   path.basename(relativePath, '.md').replace(/\-/g, ' ');
      
      // 설명 추출 (첫 번째 문단)
      const lines = content.split('\n').filter(line => line.trim());
      const descriptionLines = [];
      for (const line of lines) {
        if (line.startsWith('#')) continue;
        if (line.trim()) {
          descriptionLines.push(line.trim());
          if (descriptionLines.length >= 3) break;
        }
      }
      const description = descriptionLines.join('\n').slice(0, 200);
      
      return {
        title,
        slug,
        path: relativePath,
        content,
        description,
        lastModified: stats.mtime,
        created: stats.birthtime || stats.mtime,
        url: `https://baburger.xyz/blog/${slug}.html`
      };
    } catch (error) {
      this.log(`포스트 생성 실패 (${relativePath}): ${error.message}`, 'error');
      return null;
    }
  }

  // HTML 파일 생성
  generateHtmlFile(post) {
    const htmlContent = marked(post.content);
    const outputPath = path.join(this.outputDir, `${post.slug}.html`);
    
    // 디렉토리 생성
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    const template = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} - GO 블로그</title>
  <meta name="description" content="${post.description}">
  <link rel="stylesheet" href="/assets/css/main.css">
</head>
<body>
  <article>
    <h1>${post.title}</h1>
    ${htmlContent}
  </article>
</body>
</html>`;
    
    fs.writeFileSync(outputPath, template, 'utf-8');
  }

  // 🚀 완전 새로운 사이드바 HTML 생성 시스템
  generateSidebarHtml() {
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

  // 🚀 JSON 파일 생성 (완전 동적 로딩용)
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
          created: post.created,
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

  // RSS 피드 생성
  generateRssFeed() {
    try {
      const sortedPosts = Array.from(this.posts.values())
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 20);
      
      const rssItems = sortedPosts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${post.url}</link>
      <guid>${post.url}</guid>
      <pubDate>${new Date(post.lastModified).toUTCString()}</pubDate>
    </item>`).join('');
      
      const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>GO 블로그</title>
    <description>GO의 개발 블로그 - 옵시디언으로 작성하는 실시간 블로그</description>
    <link>https://baburger.xyz</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>ko-KR</language>${rssItems}
  </channel>
</rss>`;
      
      fs.writeFileSync(path.join(__dirname, 'rss.xml'), rssFeed, 'utf-8');
      this.log('RSS 피드 생성 완료', 'success');
    } catch (error) {
      this.log(`RSS 생성 실패: ${error.message}`, 'error');
    }
  }

  // 사이트맵 생성
  generateSitemap() {
    try {
      const urls = Array.from(this.posts.values()).map(post => `
  <url>
    <loc>${post.url}</loc>
    <lastmod>${post.lastModified.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
      
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://baburger.xyz</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${urls}
</urlset>`;
      
      fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf-8');
      this.log('사이트맵 생성 완료', 'success');
    } catch (error) {
      this.log(`사이트맵 생성 실패: ${error.message}`, 'error');
    }
  }

  // 🚀 메인 생성 함수 (완전 새로운 방식)
  async generate() {
    this.log('🚀 블로그 생성 시작...');
    
    try {
      this.posts.clear();
      this.prepareOutputDirectory();
      this.copyImages();
      this.processMarkdownFiles();
      
      // ✨ 핵심: index.html은 절대 수정하지 않음!
      // 오직 JSON 파일만 생성하여 완전 동적 로딩
      this.generateJson();
      this.generateRssFeed();
      this.generateSitemap();
      
      // 성능 보고서 생성
      const performanceReport = this.optimizer.generatePerformanceReport();
      
      this.log(`✅ 블로그 생성 완료! 총 ${this.posts.size}개 포스트 처리됨`, 'success');
      this.log(`📊 성능 보고서: ${performanceReport.totalFiles}개 파일, ${performanceReport.totalSize}`, 'info');
      
      return true;
    } catch (error) {
      this.log(`❌ 블로그 생성 실패: ${error.message}`, 'error');
      return false;
    }
  }
}

// 성능 최적화 클래스
class PerformanceOptimizer {
  constructor() {
    this.startTime = Date.now();
  }

  generatePerformanceReport() {
    try {
      const blogDir = path.join(__dirname, 'blog');
      if (!fs.existsSync(blogDir)) {
        return { totalFiles: 0, totalSize: '0 B', generationTime: 0 };
      }

      let totalFiles = 0;
      let totalSize = 0;

      const calculateSize = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            calculateSize(fullPath);
          } else {
            totalFiles++;
            totalSize += fs.statSync(fullPath).size;
          }
        });
      };

      calculateSize(blogDir);

      const formatSize = (bytes) => {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
      };

      const generationTime = Date.now() - this.startTime;
      const report = {
        totalFiles,
        totalSize: formatSize(totalSize),
        generationTime: `${generationTime}ms`
      };

      // 성능 보고서 파일 저장
      const reportPath = path.join(__dirname, 'performance-report.json');
      fs.writeFileSync(reportPath, JSON.stringify({
        ...report,
        timestamp: new Date().toISOString(),
        sizeInBytes: totalSize
      }, null, 2));

      console.log(`ℹ️ 성능 보고서 생성 완료 - 총 ${totalFiles}개 파일, ${formatSize(totalSize)}`);
      return report;
    } catch (error) {
      console.log(`❌ 성능 보고서 생성 실패: ${error.message}`);
      return { totalFiles: 0, totalSize: '0 B', generationTime: 0 };
    }
  }
}

export default BlogGenerator; 