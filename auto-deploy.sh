#!/bin/bash

# 완전 자동화 서버 배포 스크립트
PASSWORD="$1"

if [ -z "$PASSWORD" ]; then
    echo "❌ 사용법: ./auto-deploy.sh 비밀번호"
    exit 1
fi

echo "🚀 서버 실시간 감지 프로세스 자동 설정 시작..."
echo ""

# 서버에 접속해서 실행할 명령어들
echo "🔄 서버에 접속하여 설정 중..."

sshpass -p "$PASSWORD" ssh gojaehyun@baburger.xyz << 'EOF'
cd /var/www/html

echo "📁 작업 디렉토리: $(pwd)"

# 기존 프로세스 정리
echo "🔄 기존 프로세스 정리..."
sudo pkill -f "node index.js watch" || true

# 테스트 실행
echo "🧪 테스트 실행..."
node index.js generate

# systemd 서비스 시작
echo "✨ 실시간 감지 서비스 시작..."
sudo systemctl enable obsidian-blog
sudo systemctl start obsidian-blog

# 잠시 대기 후 서비스 상태 확인
sleep 3
echo "📊 서비스 상태:"
sudo systemctl status obsidian-blog --no-pager

echo ""
echo "✅ 서버 실시간 감지 프로세스 설정 완료!"
echo "🌐 웹사이트: https://baburger.xyz"
echo "📡 RSS 피드: https://baburger.xyz/rss.xml"
echo ""
echo "📋 로그 확인 명령어:"
echo "  sudo journalctl -u obsidian-blog -f"
EOF

echo ""
echo "🎉 설정 완료! 이제 맥을 꺼도 서버에서 계속 실행됩니다."
echo "🗑️ 보안을 위해 터미널 히스토리를 정리하는 것을 권장합니다." 