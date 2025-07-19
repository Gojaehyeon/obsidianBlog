// config.js
// 옵시디언 블로그 생성기 통합 설정

export default {
  // 사이트 정보
  site: {
    url: 'https://baburger.xyz',
    title: 'GO 블로그',
    description: 'GO의 개발 블로그 - 옵시디언으로 작성하는 실시간 블로그',
    author: 'GO',
    language: 'ko',
    favicon: '/assets/logo/logo.png'
  },

  // 기본 글 설정
  defaultPost: {
    // 홈페이지에서 기본으로 표시할 글의 slug
    // 빈 문자열이면 welcome 메시지 표시
    slug: 'GO/옵시디언으로-블로그-만들기',
    // 또는 파일명으로 설정 (확장자 제외)
    // filename: '250717-옵셔널'
  },

  // 기본 경로 설정
  paths: {
    markdown: 'go',
    output: 'blog',
    assets: '../assets/css/main.css',
    images: 'images'
  },

  // 파일 설정
  files: {
    markdownExt: '.md',
    excludePatterns: [
      /^\./,           // 숨김 파일
      /^\._/,          // macOS 메타데이터
      /\.tmp$/,        // 임시 파일
      /\.temp$/,       // 임시 파일
      /node_modules/,  // Node.js 모듈
      /\.obsidian/,    // Obsidian 설정
      /\.trash/        // 휴지통
    ],
    imageExts: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
    // 이미지 최적화 설정
    imageOptimization: {
      enabled: true,
      maxWidth: 1200,
      quality: 85,
      formats: ['webp', 'jpg'] // 지원할 이미지 형식
    }
  },

  // 테마 설정
  theme: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    primaryColor: '#007acc',
    secondaryTextColor: '#666666'
  },

  // 레이아웃 설정
  layout: {
    maxPostWidth: '800px',
    sidebarWidth: '300px'
  },

  // 서버 설정
  server: {
    logFile: '/var/log/obsidian-blog.log',
    watchDelay: 500, // 디바운싱 지연시간 (ms)
    port: 3000,
    host: '0.0.0.0'
  },

  // 웹 업데이트 설정
  web: {
    sidebarUpdateInterval: 5000, // 5초
    contentUpdateInterval: 3000  // 3초
  },

  // RSS 피드 설정
  rss: {
    enabled: true,
    maxItems: 20,
    title: 'GO 블로그 RSS',
    description: 'GO의 개발 블로그 최신 포스트'
  },

  // SEO 설정
  seo: {
    sitemap: {
      enabled: true,
      changefreq: 'weekly',
      priority: 0.8
    },
    openGraph: {
      enabled: true,
      type: 'article',
      locale: 'ko_KR'
    },
    twitter: {
      enabled: true,
      card: 'summary'
    }
  },

  // 성능 최적화 설정
  performance: {
    // 캐싱 설정
    cache: {
      enabled: true,
      maxAge: 3600, // 1시간
      etag: true
    },
    // 압축 설정
    compression: {
      enabled: true,
      level: 6
    },
    // 빌드 최적화
    build: {
      minifyHtml: true,
      optimizeImages: true,
      generateWebp: true
    }
  },

  // 검색 설정
  search: {
    enabled: true,
    maxResults: 10,
    minQueryLength: 2,
    placeholder: '글 제목이나 내용을 검색하세요...'
  },

  // analytics 설정 (필요시 사용)
  analytics: {
    enabled: false,
    googleAnalytics: {
      trackingId: ''
    }
  }
}; 