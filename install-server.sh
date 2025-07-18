#!/bin/bash

# Obsidian Blog Generator 서버 설치 스크립트
# 서버에서 실행하세요

set -e

echo "🚀 Obsidian Blog Generator 서버 설치 시작..."

# Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "Node.js를 먼저 설치해주세요:"
    echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
    exit 1
fi

echo "✅ Node.js 버전: $(node --version)"

# 작업 디렉토리 확인
if [ ! -d "/var/www/html" ]; then
    echo "❌ /var/www/html 디렉토리가 존재하지 않습니다."
    exit 1
fi

cd /var/www/html

# 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 로그 디렉토리 생성
echo "📁 로그 디렉토리 생성..."
sudo mkdir -p /var/log
sudo touch /var/log/obsidian-blog.log
sudo chown www-data:www-data /var/log/obsidian-blog.log
sudo chmod 644 /var/log/obsidian-blog.log

# systemd 서비스 파일 복사
echo "🔧 systemd 서비스 설정..."
sudo cp obsidian-blog.service /etc/systemd/system/
sudo systemctl daemon-reload

# 서비스 활성화 및 시작
echo "🚀 서비스 시작..."
sudo systemctl enable obsidian-blog.service
sudo systemctl start obsidian-blog.service

# 상태 확인
echo "📊 서비스 상태 확인..."
sudo systemctl status obsidian-blog.service --no-pager

echo ""
echo "✅ 설치 완료!"
echo ""
echo "📋 사용법:"
echo "  서비스 시작: sudo systemctl start obsidian-blog"
echo "  서비스 중지: sudo systemctl stop obsidian-blog"
echo "  서비스 재시작: sudo systemctl restart obsidian-blog"
echo "  상태 확인: sudo systemctl status obsidian-blog"
echo "  로그 확인: sudo journalctl -u obsidian-blog -f"
echo ""
echo "📁 로그 파일: /var/log/obsidian-blog.log"
echo "📁 감시 폴더: /var/www/html/go"
echo "📁 출력 폴더: /var/www/html/blog" 