# 옵시디언 블로그 생성기 v2.0

깔끔하고 효율적인 Obsidian 마크다운 블로그 생성기입니다.

## ✨ 특징

- 🚀 **실시간 변환**: 마크다운 파일 변경 시 자동으로 HTML 생성
- 📁 **폴더 구조 지원**: 중첩된 폴더 구조 완벽 지원
- 🖼️ **이미지 자동 처리**: 이미지 파일 자동 복사 및 경로 처리
- 🔄 **중복 제거**: 똑똑한 slug 생성으로 중복 포스트 방지
- 📱 **반응형 디자인**: 모바일 친화적인 깔끔한 스타일
- ⚡ **고성능**: 디바운싱과 효율적인 파일 감시

## 🛠️ 설치

```bash
# 의존성 설치
npm install

# 권한 설정 (실행 가능하게)
chmod +x index.js
```

## 📖 사용법

### 블로그 한 번 생성

```bash
npm run generate
# 또는
node index.js generate
```

### 실시간 감시 모드

```bash
npm run watch
# 또는 
node index.js watch
```

## 📁 프로젝트 구조

```
├── config.js              # 통합 설정 파일
├── index.js               # 메인 실행 파일
├── blog-generator.js      # 블로그 생성기 클래스
├── blog-watcher.js        # 파일 감시기 클래스
├── go/                    # 마크다운 소스 폴더
├── blog/                  # HTML 출력 폴더
└── obsidian-blog.service  # systemd 서비스 파일
```

## ⚙️ 설정

`config.js` 파일에서 모든 설정을 관리합니다:

```javascript
export default {
  paths: {
    markdown: 'go',      // 마크다운 폴더
    output: 'blog',      // HTML 출력 폴더
    // ...
  },
  theme: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    // ...
  },
  // ...
}
```

## 🖥️ 서버 배포

### systemd 서비스로 실행

```bash
# 서비스 파일 복사
sudo cp obsidian-blog.service /etc/systemd/system/

# 서비스 활성화
sudo systemctl enable obsidian-blog
sudo systemctl start obsidian-blog

# 상태 확인
sudo systemctl status obsidian-blog

# 로그 확인
sudo journalctl -u obsidian-blog -f
```

### 서비스 관리

```bash
# 재시작
sudo systemctl restart obsidian-blog

# 중지
sudo systemctl stop obsidian-blog

# 비활성화
sudo systemctl disable obsidian-blog
```

## 📝 마크다운 작성 가이드

### 폴더 구조

```
go/
├── 개발공부/
│   ├── JavaScript.md
│   └── Python.md
├── 생각정리/
│   ├── 일상.md
│   └── 회고.md
└── 프로젝트.md
```

### 이미지 삽입

```markdown
![이미지 설명](./images/example.png)
![온라인 이미지](https://example.com/image.jpg)
```

### 제외 파일/폴더

다음 파일들은 자동으로 제외됩니다:
- `.`으로 시작하는 숨김 파일
- `._`으로 시작하는 macOS 메타데이터
- `.tmp`, `.temp` 임시 파일
- `.obsidian`, `.trash` 등 Obsidian 시스템 폴더

## 🔧 개발

### 디버깅

```bash
# 상세 로그와 함께 실행
DEBUG=* npm run watch

# 단일 생성 테스트
npm run test
```

### 코드 구조

- **BlogGenerator**: 마크다운을 HTML로 변환하는 핵심 클래스
- **BlogWatcher**: 파일 변경을 감시하고 자동 재생성하는 클래스
- **config.js**: 모든 설정을 중앙집중식으로 관리

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Made with ❤️ by GO 