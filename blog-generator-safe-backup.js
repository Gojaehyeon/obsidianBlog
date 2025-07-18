#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

console.log('🚀 완전한 옵시디언 스타일 블로그 생성기 시작...');

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
      
      console.log(`✅ 처리 완료: ${title} (${slug})`);
    } catch (error) {
      console.log(`⚠️ 파일 처리 오류 (${filePath}): ${error.message}`);
    }
  }

  // 🚀 옵시디언 스타일 폴더 구조 생성
  function generateFolderStructure() {
    const structure = {};
    
    // 폴더 구조 생성
    for (const post of posts) {
      const parts = post.slug.split('/');
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
    
    return renderFolderStructure(structure);
  }

  // 폴더 구조 렌더링
  function renderFolderStructure(structure, indent = '') {
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
      html += renderFolderStructure(item.folders, indent + '  ');
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

  // 사이드바 HTML 생성 (옵시디언 스타일)
  const blogList = generateFolderStructure();

  // JSON 파일 생성
  const jsonData = {
    blogList,
    lastUpdated: new Date().toISOString(),
    totalPosts: posts.length,
    posts: posts.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
  };

  fs.writeFileSync('blog-list.json', JSON.stringify(jsonData, null, 2));
  
  console.log(`🎉 완전한 블로그 JSON 생성 완료!`);
  console.log(`📊 총 ${posts.length}개 포스트 처리됨`);
  console.log(`📁 옵시디언 스타일 폴더 구조 적용`);
  console.log(`🚀 완전 동적 로딩 시스템 완성!`);
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
  process.exit(1);
} 