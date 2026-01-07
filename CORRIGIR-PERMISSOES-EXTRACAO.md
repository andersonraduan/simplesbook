# 🔧 Corrigir Permissões - Problema na Extração

## Problema: "Permission denied" ao extrair ZIP

Os diretórios não podem ser criados porque não há permissão suficiente.

---

## ✅ Solução Completa (Execute no Servidor via SSH)

**Copie e cole TODOS os comandos de uma vez:**

```bash
cd ~/calendario.clinicalasante.pt && \
echo "=== 1. Corrigindo permissões do diretório atual ===" && \
chmod -R 755 . && \
chown -R clini489:clini489 . && \
echo "✅ Permissões corrigidas" && \
echo "" && \
echo "=== 2. Criando estrutura de diretórios necessária ===" && \
mkdir -p src/app/admin/dashboard && \
mkdir -p src/app/admin/settings && \
mkdir -p src/app/admin/usuarios && \
mkdir -p src/app/api/admin/settings && \
mkdir -p src/app/api/admin/users && \
mkdir -p src/app/api/admin/users/\[id\] && \
mkdir -p src/app/api/agendamentos && \
mkdir -p src/app/api/agendamentos/conflitos && \
mkdir -p src/app/api/agendamentos/\[id\] && \
mkdir -p src/app/api/agendamentos/\[id\]/logs && \
mkdir -p src/app/api/auth/\[...nextauth\] && \
mkdir -p src/app/api/clientes && \
mkdir -p src/app/api/clientes/\[id\] && \
mkdir -p src/app/api/notifications && \
mkdir -p src/app/api/notifications/cron && \
mkdir -p src/app/api/notifications/templates && \
mkdir -p src/app/api/notifications/templates/\[id\] && \
mkdir -p src/app/api/notifications/test && \
mkdir -p src/app/api/relatorios && \
mkdir -p src/app/api/servicos && \
mkdir -p src/app/api/servicos/\[id\] && \
mkdir -p src/app/api/user/password && \
mkdir -p src/app/api/user/preferences && \
mkdir -p src/app/api/user/profile && \
echo "✅ Diretórios criados" && \
echo "" && \
echo "=== 3. Corrigindo permissões dos diretórios criados ===" && \
chmod -R 755 src && \
chown -R clini489:clini489 src && \
echo "✅ Permissões dos diretórios corrigidas" && \
echo "" && \
echo "=== 4. Extraindo arquivos do ZIP ===" && \
unzip -o src.zip -d src/ 2>&1 | grep -v "checkdir error" && \
echo "✅ Arquivos extraídos" && \
echo "" && \
echo "=== 5. Corrigindo permissões finais ===" && \
chmod -R 755 . && \
chown -R clini489:clini489 . && \
echo "✅ Permissões finais corrigidas" && \
echo "" && \
echo "=== 6. Verificando arquivos extraídos ===" && \
ls -la src/app/api/auth/\[...nextauth\]/route.ts && \
ls -la src/auth.ts && \
echo "✅ Verificação concluída"
```

---

## 🔄 Alternativa: Extrair e Corrigir Depois

Se preferir extrair primeiro e corrigir depois:

```bash
cd ~/calendario.clinicalasante.pt && \
echo "=== 1. Extraindo ZIP (ignorando erros de permissão) ===" && \
unzip -o src.zip -d src/ 2>&1 | grep -v "checkdir error" || true && \
echo "" && \
echo "=== 2. Criando diretórios que falharam ===" && \
mkdir -p src/app/admin/dashboard && \
mkdir -p src/app/admin/settings && \
mkdir -p src/app/admin/usuarios && \
mkdir -p src/app/api/admin/settings && \
mkdir -p src/app/api/admin/users && \
mkdir -p src/app/api/admin/users/\[id\] && \
mkdir -p src/app/api/agendamentos && \
mkdir -p src/app/api/agendamentos/conflitos && \
mkdir -p src/app/api/agendamentos/\[id\] && \
mkdir -p src/app/api/agendamentos/\[id\]/logs && \
mkdir -p src/app/api/auth/\[...nextauth\] && \
mkdir -p src/app/api/clientes && \
mkdir -p src/app/api/clientes/\[id\] && \
mkdir -p src/app/api/notifications && \
mkdir -p src/app/api/notifications/cron && \
mkdir -p src/app/api/notifications/templates && \
mkdir -p src/app/api/notifications/templates/\[id\] && \
mkdir -p src/app/api/notifications/test && \
mkdir -p src/app/api/relatorios && \
mkdir -p src/app/api/servicos && \
mkdir -p src/app/api/servicos/\[id\] && \
mkdir -p src/app/api/user/password && \
mkdir -p src/app/api/user/preferences && \
mkdir -p src/app/api/user/profile && \
echo "" && \
echo "=== 3. Extraindo novamente (agora com diretórios criados) ===" && \
unzip -o src.zip -d src/ 2>&1 | grep -v "checkdir error" || true && \
echo "" && \
echo "=== 4. Corrigindo TODAS as permissões ===" && \
chmod -R 755 . && \
chown -R clini489:clini489 . && \
echo "✅ Concluído!"
```

---

## 📝 Explicação

O problema ocorre porque:
1. O ZIP foi criado com uma estrutura de diretórios
2. Ao extrair, o `unzip` tenta criar os diretórios
3. Mas o usuário atual não tem permissão para criar em alguns locais
4. A solução é criar os diretórios manualmente ANTES de extrair

---

## ✅ Verificar se Funcionou

```bash
# Verificar se os arquivos importantes existem
ls -la src/app/api/auth/\[...nextauth\]/route.ts
ls -la src/auth.ts
ls -la src/middleware.ts

# Verificar permissões
ls -ld src/app/api/auth
```

Se todos os arquivos existirem, o problema foi resolvido! 🎉

---

## 🆘 Se Ainda Der Erro

### Verificar usuário atual:
```bash
whoami
id
```

### Verificar permissões do diretório:
```bash
ls -ld ~/calendario.clinicalasante.pt
```

### Tentar com sudo (se tiver acesso):
```bash
sudo chown -R clini489:clini489 ~/calendario.clinicalasante.pt
sudo chmod -R 755 ~/calendario.clinicalasante.pt
```

