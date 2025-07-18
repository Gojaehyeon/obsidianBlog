#!/bin/bash

# 서버 배포 및 실시간 감지 프로세스 시작 스크립트
echo "🚀 서버 배포 및 실시간 감지 시작..."

# 서버에 접속해서 실행할 명령어들
ssh gojaehyun@baburger.xyz << 'EOF'
cd /var/www/html

echo "📁 작업 디렉토리: $(pwd)"

# 현재 서비스 중지
echo "🛑 기존 서비스 중지..."
sudo systemctl stop obsidian-blog

# 기존 프로세스 종료 (혹시 남아있을 수 있는 프로세스)
echo "🔄 기존 프로세스 정리..."
sudo pkill -f "node index.js watch" || true

# systemd 설정 재로드
echo "🔄 systemd 재로드..."
sudo systemctl daemon-reload

# 권한 설정
echo "🔧 권한 설정..."
chmod +x index.js

# 테스트 실행 (한 번만 생성)
echo "🧪 테스트 실행..."
node index.js generate

# systemd 서비스 시작 (실시간 감지 모드)
echo "✨ 실시간 감지 서비스 시작..."
sudo systemctl enable obsidian-blog
sudo systemctl start obsidian-blog

# 잠시 대기 후 서비스 상태 확인
sleep 3
echo "📊 서비스 상태:"
sudo systemctl status obsidian-blog --no-pager

echo ""
echo "✅ 서버 배포 및 실시간 감지 설정 완료!"
echo ""
echo "📋 서비스 관리 명령어:"
echo "  상태 확인: sudo systemctl status obsidian-blog"
echo "  로그 확인: sudo journalctl -u obsidian-blog -f"
echo "  서비스 중지: sudo systemctl stop obsidian-blog"
echo "  서비스 재시작: sudo systemctl restart obsidian-blog"
echo ""
echo "🌐 웹사이트: https://baburger.xyz"
echo "📡 RSS 피드: https://baburger.xyz/rss.xml"
echo "🗺️ 사이트맵: https://baburger.xyz/sitemap.xml"
EOF 