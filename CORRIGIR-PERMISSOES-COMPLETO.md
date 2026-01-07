# 🔧 Correção Completa - Permissões e Turbopack

## Problema: Next.js tentando usar Turbopack em produção

O Next.js está detectando modo dev mesmo com NODE_ENV=production.

---

## ✅ Solução Completa (Execute no Servidor)

```bash
cd ~/calendario.clinicalasante.pt && \
echo "=== 1. Parando PM2 ===" && \
pm2 stop simplesbook 2>/dev/null || true && \
pm2 delete simplesbook 2>/dev/null || true && \
echo "✅ PM2 parado" && \
echo "" && \
echo "=== 2. Corrigindo TODAS as permissões ===" && \
chmod -R 755 . && \
chown -R clini489:clini489 . && \
echo "✅ Permissões corrigidas" && \
echo "" && \
echo "=== 3. Removendo TODOS os caches ===" && \
rm -rf .next/dev .next/cache .next/.turbo 2>/dev/null && \
rm -rf node_modules/.cache 2>/dev/null && \
echo "✅ Caches removidos" && \
echo "" && \
echo "=== 4. Verificando se build existe ===" && \
ls -la .next/server/ 2>&1 | head -5 && \
echo "" && \
echo "=== 5. Reiniciando PM2 com NODE_ENV forçado ===" && \
NODE_ENV=production pm2 start ecosystem.config.js --update-env && \
pm2 save && \
echo "✅ PM2 iniciado" && \
echo "" && \
echo "=== 6. Aguardando 15 segundos ===" && \
sleep 15 && \
echo "" && \
echo "=== 7. Verificando status ===" && \
pm2 status && \
echo "" && \
echo "=== 8. Verificando logs (últimas 10 linhas) ===" && \
pm2 logs simplesbook --lines 10 --nostream && \
echo "" && \
echo "=== 9. Testando porta 3000 ===" && \
curl -I http://localhost:3000 2>&1 | head -5
```

---

## 🔍 Se Ainda Der Erro

### Ver logs completos de erro:

```bash
pm2 logs simplesbook --err --lines 50
```

### Testar server.js manualmente:

```bash
cd ~/calendario.clinicalasante.pt
NODE_ENV=production node server.js
# Deve mostrar: "> Servidor pronto em http://localhost:3000"
# Se der erro, copie a mensagem completa
```

### Verificar se build está completo:

```bash
ls -la .next/server/app* | head -5
ls -la .next/static/ | head -5
```

---

## 📝 O que foi corrigido:

1. ✅ **next.config.js** - Removido Turbopack
2. ✅ **server.js** - Força modo production
3. ✅ **Permissões** - Toda a estrutura corrigida
4. ✅ **Cache** - Todos os caches removidos

---

**Execute o comando completo acima!** 🚀

