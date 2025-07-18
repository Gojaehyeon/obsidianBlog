#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

console.log('🚀 간단한 블로그 JSON 생성기 시작...');

try {
  const sourceDir = './go';
  const posts = [];

  // 안전한 파일 읽기 함수
  function readDirectory(dir) {
    if (!fs.existsSync(dir)) return [];
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      // 시스템 파일 무시
      if (item.name.startsWith('.') || item.name.startsWith('_')) continue;
      
      if (item.isDirectory()) {
        files = files.concat(readDirectory(fullPath));
      } else if (item.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // 마크다운 파일 찾기
  const markdownFiles = readDirectory(sourceDir);
  console.log(`📄 마크다운 파일 ${markdownFiles.length}개 발견`);

  // 각 파일 처리
  for (const filePath of markdownFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      const relativePath = path.relative(sourceDir, filePath);
      
      // 슬러그 생성
      const slug = relativePath
        .replace(/\.md$/, '')
        .replace(/\\/g, '/')
        .replace(/\s+/g, '-')
        .replace(/[^\w가-힣\-\/]/g, '')
        .replace(/\-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // 제목 추출
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : path.basename(relativePath, '.md');
      
      // 설명 추출
      const description = content.slice(0, 150).replace(/[#\n]/g, ' ').trim();
      
      posts.push({
        title,
        slug,
        path: relativePath,
        description,
        lastModified: stats.mtime,
        url: `https://baburger.xyz/blog/${slug}.html`
      });
      
      console.log(`✅ 처리 완료: ${title}`);
    } catch (error) {
      console.log(`⚠️ 파일 처리 오류 (${filePath}): ${error.message}`);
    }
  }

  // 사이드바 HTML 생성
  let blogList = '';
  for (const post of posts) {
    blogList += `<li class="sidebar-file"><a href="#" class="blog-link" data-slug="${post.slug}">${post.title}</a></li>\n`;
  }

  // JSON 파일 생성
  const jsonData = {
    blogList,
    lastUpdated: new Date().toISOString(),
    totalPosts: posts.length,
    posts
  };

  fs.writeFileSync('blog-list.json', JSON.stringify(jsonData, null, 2));
  
  console.log(`🎉 JSON 파일 생성 완료! 총 ${posts.length}개 포스트 처리됨`);
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
  process.exit(1);
} 