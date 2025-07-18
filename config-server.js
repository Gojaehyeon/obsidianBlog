// config-server.js - 서버용 블로그 생성 설정 파일
export default {
  // 폴더 설정 (서버 경로)
  markdownDir: '/var/www/html/go',           // 마크다운 파일이 있는 폴더
  outputDir: '/var/www/html/blog',           // HTML 파일이 출력될 폴더
  
  // 사이트 설정
  siteTitle: 'GO - 블로그',
  logoText: 'GO',
  
  // 스타일 설정 (세련된 블랙+화이트 모노톤)
  theme: {
    primaryColor: '#ffffff',   // 메인 색상 (화이트)
    backgroundColor: '#0a0a0a', // 전체 배경색 (진한 블랙)
    sidebarBackground: '#111111', // 사이드바 배경색 (블랙)
    textColor: '#f8f9fa',      // 텍스트 색상 (밝은 화이트)
    secondaryTextColor: '#adb5bd', // 보조 텍스트 색상 (연한 그레이)
    borderColor: '#2d3748',    // 테두리 색상 (다크 그레이)
    codeBackground: '#1a202c', // 코드 블록 배경색 (다크 그레이)
    postBackground: '#111111', // 포스트 배경색 (블랙)
    accentColor: '#e2e8f0',    // 액센트 색상 (라이트 그레이)
    hoverColor: '#2d3748',     // 호버 색상 (다크 그레이)
    shadowColor: 'rgba(0, 0, 0, 0.3)', // 그림자 색상
    gradientStart: '#1a202c',  // 그라데이션 시작
    gradientEnd: '#2d3748'     // 그라데이션 끝
  },
  
  // 레이아웃 설정
  layout: {
    sidebarWidth: '320px',     // 사이드바 너비 (약간 넓게)
    maxPostWidth: '900px',     // 포스트 최대 너비 (넓게)
    containerMaxWidth: '700px' // 컨테이너 최대 너비 (넓게)
  },
  
  // 파일 설정
  fileSettings: {
    excludePrefixes: ['.', '_'], // 제외할 파일/폴더 접두사
    markdownExtension: '.md'     // 마크다운 파일 확장자
  },
  
  // CSS 파일 경로 (서버 기준)
  cssPath: '/assets/css/main.css',
  
  // 메시지 설정
  messages: {
    welcomeTitle: 'GO 블로그',
    welcomeText: '사이드바에서 원하는 글을 선택하세요.',
    errorTitle: '오류',
    errorMessage: '글을 불러올 수 없습니다.',
    completionMessage: '블로그 변환 완료!'
  },
  
  // 서버 설정
  server: {
    port: 3000,
    host: '0.0.0.0',
    logFile: '/var/log/obsidian-blog.log'
  }
}; 