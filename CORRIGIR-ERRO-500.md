# 🔧 Corrigir Erro 500 - Guia Completo

## Problemas Identificados:

1. ❌ **Erro de permissão** no cache do Next.js
2. ❌ **Next.js rodando em modo dev** (deveria ser production)
3. ❌ **.htaccess com Passenger** (deveria ser apenas proxy)

---

## ✅ Solução Completa (Execute no Servidor)

**Copie e cole tudo de uma vez:**

```bash
cd ~/calendario.clinicalasante.pt && \
echo "=== 1. Corrigindo permissões do .next ===" && \
chmod -R 755 .next && \
chown -R clini489:clini489 .next && \
echo "✅ Permissões corrigidas" && \
echo "" && \
echo "=== 2. Removendo cache problemático ===" && \
rm -rf .next/dev 2>/dev/null && \
rm -rf .next/cache 2>/dev/null && \
echo "✅ Cache removido" && \
echo "" && \
echo "=== 3. Substituindo .htaccess (remover Passenger) ===" && \
cp .htaccess .htaccess.passenger.backup && \
cat > .htaccess << 'EOFHTACCESS'
# SimplesBook - Proxy Reverso para Express + PM2
# REMOVER TODAS AS CONFIGURAÇÕES DO PASSENGER

RewriteEngine On

# Proxy reverso para Express na porta 3000
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Redirecionar HTTP para HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Headers de segurança
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "origin-when-cross-origin"
</IfModule>
EOFHTACCESS
echo "✅ .htaccess atualizado" && \
echo "" && \
echo "=== 4. Parando PM2 ===" && \
pm2 stop simplesbook && \
pm2 delete simplesbook 2>/dev/null || true && \
echo "✅ PM2 parado" && \
echo "" && \
echo "=== 5. Reiniciando PM2 com configuração correta ===" && \
NODE_ENV=production pm2 start ecosystem.config.js && \
pm2 save && \
echo "✅ PM2 reiniciado" && \
echo "" && \
echo "=== 6. Aguardando inicialização (10 segundos) ===" && \
sleep 10 && \
echo "" && \
echo "=== 7. Verificando status ===" && \
pm2 status && \
echo "" && \
echo "=== 8. Verificando logs ===" && \
pm2 logs simplesbook --lines 10 --nostream && \
echo "" && \
echo "=== 9. Testando porta 3000 ===" && \
curl -I http://localhost:3000 2>&1 | head -5
```

---

## 🔍 Se Ainda Der Erro

### Verificar logs detalhados:

```bash
pm2 logs simplesbook --err --lines 50
```

### Verificar se porta 3000 está escutando:

```bash
# Ver processos Node.js
ps aux | grep node | grep -v grep

# Ver se porta 3000 está em uso
ss -tuln | grep 3000 || echo "Porta 3000 não está escutando"
```

### Testar server.js manualmente:

```bash
cd ~/calendario.clinicalasante.pt
NODE_ENV=production node server.js
# Deve mostrar: "> Servidor pronto em http://localhost:3000"
# Pressione Ctrl+C para parar
```

---

## 📝 O que foi corrigido:

1. ✅ **server.js** - Força modo production
2. ✅ **Permissões** - .next com permissões corretas
3. ✅ **Cache** - Removido cache problemático
4. ✅ **.htaccess** - Removido Passenger, apenas proxy
5. ✅ **PM2** - Reiniciado com NODE_ENV=production

---

**Execute o comando completo acima e me envie o resultado!** 🚀

