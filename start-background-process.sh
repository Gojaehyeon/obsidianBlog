#!/bin/bash

# 서버에서 백그라운드로 실시간 감지 프로세스 시작
echo "🚀 서버 백그라운드 프로세스 시작..."

sshpass -p "9999" ssh gojaehyun@baburger.xyz << 'EOF'
cd /var/www/html

# 기존 프로세스 확인 및 종료
echo "🔄 기존 프로세스 확인..."
pkill -f "node index.js watch" || true

# 백그라운드에서 실시간 감지 프로세스 시작
echo "✨ 백그라운드에서 실시간 감지 프로세스 시작..."
nohup node index.js watch > /tmp/obsidian-blog.log 2>&1 &

# 잠시 대기
sleep 2

# 프로세스 확인
echo "📊 실행 중인 프로세스 확인:"
ps aux | grep "node index.js watch" | grep -v grep

echo ""
echo "✅ 백그라운드 프로세스 시작 완료!"
echo "📝 로그 파일: /tmp/obsidian-blog.log"
echo "🌐 웹사이트: https://baburger.xyz"
EOF

echo ""
echo "🎉 서버에서 실시간 감지 프로세스가 백그라운드로 실행 중입니다!"
echo "💻 이제 맥을 꺼도 서버에서 계속 실행됩니다." 