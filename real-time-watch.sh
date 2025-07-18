#!/bin/bash

# 🚀 실시간 옵시디언 블로그 감시 시스템
# 파일 변경을 실시간으로 감지하여 자동 업데이트

echo "🚀 실시간 블로그 감시 시작..."
echo "📁 감시 폴더: /var/www/html/go"
echo "📄 출력 폴더: /var/www/html/blog"
echo "⏰ 시작 시간: $(date)"
echo "=================================="

# PID 파일로 중복 실행 방지
PID_FILE="/tmp/blog-watch.pid"
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "❌ 이미 실행 중인 감시 프로세스가 있습니다 (PID: $OLD_PID)"
        echo "   기존 프로세스를 중지하려면: kill $OLD_PID"
        exit 1
    fi
fi

# 현재 PID 저장
echo $$ > "$PID_FILE"

# 종료 시 PID 파일 정리
trap 'rm -f "$PID_FILE"; echo "🛑 감시 프로세스 종료됨"; exit' INT TERM

# 작업 디렉토리 이동
cd /var/www/html

# Node.js와 필요한 모듈이 있는지 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다"
    exit 1
fi

if [ ! -f "index.js" ]; then
    echo "❌ index.js 파일을 찾을 수 없습니다"
    exit 1
fi

# 로그 파일 설정
LOG_FILE="/var/log/blog-watch.log"
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/blog-watch.log"

echo "📝 로그 파일: $LOG_FILE"
echo "🔄 실시간 감시 시작..."

# index.js watch 명령 실행
node index.js watch 2>&1 | while IFS= read -r line; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $line" | tee -a "$LOG_FILE"
done 