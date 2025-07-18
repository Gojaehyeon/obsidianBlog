#!/bin/bash
echo "🚀 실시간 블로그 감시 시작..."

while true; do
  echo "[$(date)] 🔄 블로그 업데이트 중..."
  node final-generator.js > /tmp/blog-update.log 2>&1
  if [ $? -eq 0 ]; then
    echo "[$(date)] ✅ 업데이트 완료"
  else
    echo "[$(date)] ❌ 업데이트 실패"
  fi
  sleep 30
done 