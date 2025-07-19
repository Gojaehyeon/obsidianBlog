#!/bin/bash

# SSH 키 기반 인증 설정 스크립트
echo "🔐 SSH 키 기반 인증 설정"
echo ""

# SSH 키 생성 (이미 있으면 건너뛰기)
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "🔑 SSH 키 생성 중..."
    ssh-keygen -t rsa -b 4096 -C "$(whoami)@$(hostname)" -f ~/.ssh/id_rsa -N ""
    echo "✅ SSH 키 생성 완료"
else
    echo "✅ SSH 키가 이미 존재합니다"
fi

echo ""
echo "📋 다음 단계를 따라 SSH 키를 서버에 등록하세요:"
echo ""
echo "1. 공개 키 내용 복사:"
echo "   cat ~/.ssh/id_rsa.pub"
echo ""
echo "2. 서버에 접속:"
echo "   ssh gojaehyun@baburger.xyz"
echo ""
echo "3. 서버에서 authorized_keys 파일에 공개 키 추가:"
echo "   mkdir -p ~/.ssh"
echo "   echo '복사한_공개키_내용' >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo "   chmod 700 ~/.ssh"
echo ""
echo "4. 설정 완료 후 비밀번호 없이 접속 가능:"
echo "   ssh gojaehyun@baburger.xyz"
echo ""
echo "📌 참고: 이 설정은 한 번만 하면 됩니다!" 