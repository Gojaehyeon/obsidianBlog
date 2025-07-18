// blog-generator.js
// 깔끔한 클래스 기반 블로그 생성기

import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from './config.js';
import PerformanceOptimizer from './performance-optimizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BlogGenerator {
  constructor() {
    this.config = config;
    this.posts = new Map(); // slug를 키로 하는 포스트 맵
    this.mdDir = path.resolve(__dirname, this.config.paths.markdown);
    this.outDir = path.resolve(__dirname, this.config.paths.output);
    this.siteUrl = this.config.site?.url || 'https://baburger.xyz';
    this.siteTitle = this.config.site?.title || 'GO 블로그';
    this.siteDescription = this.config.site?.description || 'GO의 개발 블로그 - 옵시디언으로 작성하는 실시간 블로그';
    this.optimizer = new PerformanceOptimizer(this.config);
  }

  // 로그 출력
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${emoji} ${message}`);
  }

  // 파일이 마크다운인지 확인
  isMarkdownFile(filename) {
    const name = filename.toLowerCase();
    return name.endsWith(this.config.files.markdownExt) && 
           !this.config.files.excludePatterns.some(pattern => pattern.test(filename));
  }

  // 파일이 이미지인지 확인
  isImageFile(filename) {
    const name = filename.toLowerCase();
    return this.config.files.imageExts.some(ext => name.endsWith(ext)) &&
           !this.config.files.excludePatterns.some(pattern => pattern.test(filename));
  }

  // 디렉토리가 유효한지 확인
  isValidDirectory(dirname) {
    return !this.config.files.excludePatterns.some(pattern => pattern.test(dirname));
  }

  // slug 생성
  generateSlug(filePath) {
    return filePath
      .replace(new RegExp(`\\${this.config.files.markdownExt}$`, 'i'), '')
      .replace(/\\/g, '/')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-\/가-힣ㄱ-ㅎㅏ-ㅣ]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // 재귀적으로 파일 찾기
  findFiles(dir, isValidFile, relativeTo = '') {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && this.isValidDirectory(entry.name)) {
          const subFiles = this.findFiles(
            path.join(dir, entry.name),
            isValidFile,
            path.join(relativeTo, entry.name)
          );
          files.push(...subFiles);
        } else if (entry.isFile() && isValidFile(entry.name)) {
          files.push({
            fullPath: path.join(dir, entry.name),
            relativePath: path.join(relativeTo, entry.name),
            name: entry.name
          });
        }
      }
    } catch (error) {
      this.log(`디렉토리 읽기 실패: ${dir} - ${error.message}`, 'error');
    }
    
    return files;
  }

  // 출력 디렉토리 준비
  prepareOutputDirectory() {
    if (!fs.existsSync(this.outDir)) {
      fs.mkdirSync(this.outDir, { recursive: true });
      this.log(`출력 폴더 생성: ${this.outDir}`);
    }

    // 기존 HTML 파일 정리
    try {
      const existingFiles = fs.readdirSync(this.outDir, { withFileTypes: true });
      for (const file of existingFiles) {
        if (file.isFile() && file.name.endsWith('.html')) {
          fs.unlinkSync(path.join(this.outDir, file.name));
        }
      }
      this.log('기존 HTML 파일 정리 완료');
    } catch (error) {
      this.log(`파일 정리 실패: ${error.message}`, 'warn');
    }
  }

  // 이미지 파일 복사
  copyImages() {
    const imageFiles = this.findFiles(this.mdDir, (name) => this.isImageFile(name));
    this.log(`이미지 파일 ${imageFiles.length}개 발견`);

    for (const imageFile of imageFiles) {
      try {
        const outputPath = path.join(this.outDir, imageFile.relativePath);
        const outputDir = path.dirname(outputPath);
        
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // 이미지 최적화 체크
        const imageInfo = this.optimizer.optimizeImage(imageFile.fullPath);
        
        fs.copyFileSync(imageFile.fullPath, outputPath);
        this.log(`이미지 복사: ${imageFile.relativePath}`);
      } catch (error) {
        this.log(`이미지 복사 실패: ${imageFile.relativePath} - ${error.message}`, 'warn');
      }
    }
  }

  // HTML 템플릿 생성
  generateHtmlTemplate(title, content, description = '') {
    const metaDescription = description || `${title} - ${this.siteTitle}`;
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${this.siteTitle}</title>
  <meta name="description" content="${metaDescription}">
  <meta name="author" content="GO">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${this.siteTitle}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${metaDescription}">
  <link rel="stylesheet" href="${this.config.paths.assets}">
  <link rel="alternate" type="application/rss+xml" title="${this.siteTitle} RSS" href="/rss.xml">
  <style>
    body {
      max-width: ${this.config.layout.maxPostWidth};
      margin: 40px auto;
      background: ${this.config.theme.backgroundColor};
      color: ${this.config.theme.textColor};
      padding: 2em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      margin: 1em 0;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 2em;
      margin-bottom: 1em;
    }
    code {
      background: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', monospace;
    }
    pre {
      background: #f5f5f5;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
    .post-meta {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 2em;
      padding-bottom: 1em;
      border-bottom: 1px solid #eee;
    }
  </style>
</head>
<body>
  <header style="margin-bottom: 2em;">
    <a href="/index.html" style="color: ${this.config.theme.primaryColor}; text-decoration: none;">← 메인으로</a>
  </header>
  <h1>${title}</h1>
  <article>${content}</article>
  <footer style="margin-top: 3em; padding-top: 2em; border-top: 1px solid #eee; text-align: center; color: #666;">
    <p>© ${new Date().getFullYear()} ${this.siteTitle}</p>
  </footer>
</body>
</html>`;
  }

  // 마크다운 파일 처리
  processMarkdownFiles() {
    const mdFiles = this.findFiles(this.mdDir, (name) => this.isMarkdownFile(name));
    this.log(`마크다운 파일 ${mdFiles.length}개 발견`);

    for (const mdFile of mdFiles) {
      try {
        const content = fs.readFileSync(mdFile.fullPath, 'utf-8');
        const title = path.basename(mdFile.name, this.config.files.markdownExt);
        const slug = this.generateSlug(mdFile.relativePath);
        const stats = fs.statSync(mdFile.fullPath);

        // 중복 체크
        if (this.posts.has(slug)) {
          this.log(`중복 slug 건너뛰기: ${slug}`, 'warn');
          continue;
        }

        // 이미지 경로 처리
        const processedContent = content.replace(
          /!\[([^\]]*)\]\(([^)]+)\)/g,
          (match, alt, src) => {
            if (src.startsWith('http') || src.startsWith('/')) {
              return match;
            }
            return `![${alt}](${src})`;
          }
        );

        // 글 요약 생성 (첫 번째 단락)
        const description = this.extractDescription(content);
        const htmlContent = marked.parse(processedContent);
        const htmlTemplate = this.generateHtmlTemplate(title, htmlContent, description);

        // HTML 파일 저장
        const outputFile = path.join(this.outDir, `${slug}.html`);
        const outputDir = path.dirname(outputFile);
        
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // HTML 최적화 적용
        const optimizedHtml = this.optimizer.optimizeHtml(htmlTemplate);
        fs.writeFileSync(outputFile, optimizedHtml, 'utf-8');
        this.log(`HTML 생성: ${slug}.html`);

        // 포스트 정보 저장
        this.posts.set(slug, {
          title,
          slug,
          path: mdFile.relativePath,
          description,
          content: processedContent,
          htmlContent,
          lastModified: stats.mtime,
          created: stats.birthtime || stats.mtime,
          url: `${this.siteUrl}/blog/${slug}.html`
        });

      } catch (error) {
        this.log(`파일 처리 실패: ${mdFile.name} - ${error.message}`, 'error');
      }
    }
  }

  // 글 요약 추출
  extractDescription(content) {
    // 첫 번째 단락을 요약으로 사용
    const firstParagraph = content.split('\n\n')[0];
    // 마크다운 문법 제거하고 150자로 제한
    return firstParagraph
      .replace(/#+\s+/g, '') // 헤더 제거
      .replace(/\*\*(.*?)\*\*/g, '$1') // 볼드 제거
      .replace(/\*(.*?)\*/g, '$1') // 이탤릭 제거
      .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 제거
      .replace(/\[.*?\]\(.*?\)/g, '') // 링크 제거
      .trim()
      .substring(0, 150);
  }

  // 사이드바 HTML 생성
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
    
    // 폴더 먼저 렌더링
    folders.sort((a, b) => a.key.localeCompare(b.key)).forEach(({ key, item }) => {
      html += `${indent}<li class="sidebar-folder"><span>${key}</span><ul>\n`;
      html += this.renderFolderStructure(item.folders, indent + '  ');
      html += `${indent}</ul></li>\n`;
    });
    
    // 파일 렌더링
    files.sort((a, b) => a.key.localeCompare(b.key)).forEach(({ key, item }) => {
      item.files.forEach(file => {
        html += `${indent}<li class="sidebar-file"><a href="#" class="blog-link" data-slug="${file.slug}">${file.title}</a></li>\n`;
      });
    });
    
    return html;
  }

  // RSS 피드 생성
  generateRssFeed() {
    try {
      const sortedPosts = Array.from(this.posts.values())
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 20); // 최신 20개 포스트

      const rssItems = sortedPosts.map(post => {
        const pubDate = new Date(post.lastModified).toUTCString();
        const escapedTitle = this.escapeXml(post.title);
        const escapedDescription = this.escapeXml(post.description);
        const guid = `${this.siteUrl}/blog/${post.slug}.html`;
        
        return `    <item>
      <title>${escapedTitle}</title>
      <description>${escapedDescription}</description>
      <link>${post.url}</link>
      <guid isPermaLink="true">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      }).join('\n');

      const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${this.escapeXml(this.siteTitle)}</title>
    <description>${this.escapeXml(this.siteDescription)}</description>
    <link>${this.siteUrl}</link>
    <atom:link href="${this.siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Obsidian Blog Generator</generator>
${rssItems}
  </channel>
</rss>`;

      const rssPath = path.join(__dirname, 'rss.xml');
      fs.writeFileSync(rssPath, rssContent, 'utf-8');
      this.log('RSS 피드 생성 완료', 'success');
    } catch (error) {
      this.log(`RSS 피드 생성 실패: ${error.message}`, 'error');
    }
  }

  // XML 특수문자 이스케이프
  escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 사이트맵 생성
  generateSitemap() {
    try {
      const sitemapItems = Array.from(this.posts.values()).map(post => {
        const lastmod = new Date(post.lastModified).toISOString().split('T')[0];
        return `  <url>
    <loc>${post.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }).join('\n');

      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${this.siteUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${sitemapItems}
</urlset>`;

      const sitemapPath = path.join(__dirname, 'sitemap.xml');
      fs.writeFileSync(sitemapPath, sitemapContent, 'utf-8');
      this.log('사이트맵 생성 완료', 'success');
    } catch (error) {
      this.log(`사이트맵 생성 실패: ${error.message}`, 'error');
    }
  }

  // 메인 index.html은 하드코딩 없이 완전 동적 로딩만 사용
  updateMainIndex() {
    // 하드코딩된 사이드바 업데이트 제거 - JSON 파일을 통한 동적 로딩만 사용
    this.log('동적 로딩 전용 모드 - index.html 하드코딩 업데이트 생략', 'info');
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

  // 전체 생성 프로세스 실행
  async generate() {
    this.log('🚀 블로그 생성 시작...');
    
    try {
      this.posts.clear();
      this.prepareOutputDirectory();
      this.copyImages();
      this.processMarkdownFiles();
      this.updateMainIndex();
      this.generateJson();
      this.generateRssFeed();
      this.generateSitemap();
      
      // 성능 보고서 생성
      const performanceReport = this.optimizer.generatePerformanceReport();
      
      this.log(`✅ 블로그 생성 완료! 총 ${this.posts.size}개 포스트 처리됨`, 'success');
      this.log(`📊 성능 보고서: ${performanceReport.summary.totalFiles}개 파일, ${performanceReport.summary.totalSize}`, 'info');
      return true;
    } catch (error) {
      this.log(`❌ 블로그 생성 실패: ${error.message}`, 'error');
      return false;
    }
  }
}

export default BlogGenerator; 