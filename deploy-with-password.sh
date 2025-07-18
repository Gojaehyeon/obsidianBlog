#!/bin/bash

# 비밀번호 기반 서버 배포 스크립트
echo "🚀 서버 실시간 감지 프로세스 자동 설정"
echo ""
echo "⚠️  비밀번호를 입력하면 자동으로 서버에서 실시간 감지 프로세스를 설정합니다."
echo ""

# 사용자에게 비밀번호 입력받기 (화면에 표시되지 않음)
echo -n "gojaehyun@baburger.xyz 비밀번호를 입력하세요: "
read -s PASSWORD
echo ""
echo ""

# 서버에 접속해서 실행할 명령어들
echo "🔄 서버에 접속하여 설정 중..."

# sshpass를 사용하여 비밀번호 자동 입력
# (sshpass가 없으면 설치 필요: brew install sshpass)
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

# 비밀번호 변수 정리
unset PASSWORD

echo ""
echo "🎉 설정 완료! 이제 맥을 꺼도 서버에서 계속 실행됩니다." 