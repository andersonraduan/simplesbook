# 🧹 Limpeza Segura do Servidor - Passo a Passo

## ⚠️ IMPORTANTE: Não apague tudo!

Alguns arquivos são importantes e devem ser preservados.

---

## 📋 Passo 1: Fazer Backup dos Arquivos Importantes

Execute no servidor (SSH):

```bash
cd ~/calendario.clinicalasante.pt

# Criar pasta de backup
mkdir -p backup-$(date +%Y%m%d)

# Fazer backup dos arquivos importantes
cp .env backup-$(date +%Y%m%d)/ 2>/dev/null || echo ".env nao existe"
cp .htaccess backup-$(date +%Y%m%d)/ 2>/dev/null || echo ".htaccess nao existe"
cp app.js backup-$(date +%Y%m%d)/ 2>/dev/null || echo "app.js nao existe"

echo "Backup criado em: backup-$(date +%Y%m%d)/"
```

---

## 🗑️ Passo 2: Limpar Apenas o Necessário

Execute no servidor (SSH):

```bash
cd ~/calendario.clinicalasante.pt

# Remover apenas pastas/arquivos que serão substituídos
rm -rf .next
rm -rf node_modules
rm -rf src
rm -rf prisma
rm -rf public
rm -f package.json
rm -f package-lock.json
rm -f next.config.js
rm -f tsconfig.json

# NÃO remover:
# - .env (tem suas configurações)
# - .htaccess (configuração do Passenger)
# - app.js (pode manter se for o mesmo)
# - tmp/ (pasta do Passenger)

echo "Limpeza concluida!"
```

---

## 📦 Passo 3: Enviar Novos Arquivos

1. Envie o arquivo ZIP via FTP
2. Descompacte no servidor:

```bash
cd ~/calendario.clinicalasante.pt
unzip deploy-*.zip -d .
```

---

## ✅ Passo 4: Verificar e Ajustar

```bash
# Verificar se .env existe (se nao, copie do backup)
ls -la .env || cp backup-*/env .env

# Verificar se .htaccess existe
ls -la .htaccess

# Ajustar permissões
chmod -R 755 .
chown -R clini489:clini489 .
```

---

## 🔄 Alternativa: Limpeza Completa (CUIDADO!)

**Só use se tiver certeza que tem backup de tudo:**

```bash
cd ~/calendario.clinicalasante.pt

# Fazer backup completo
tar -czf backup-completo-$(date +%Y%m%d).tar.gz .

# Limpar tudo
rm -rf * .[^.]* 2>/dev/null

# Restaurar .env e .htaccess do backup se necessário
# tar -xzf backup-completo-*.tar.gz .env .htaccess
```

---

## 📝 Checklist Seguro

- [ ] Backup do `.env` feito
- [ ] Backup do `.htaccess` feito
- [ ] Pastas antigas removidas (`.next`, `node_modules`, `src`, etc)
- [ ] Arquivos novos descompactados
- [ ] `.env` verificado/restaurado
- [ ] Permissões ajustadas
- [ ] Aplicação reiniciada

---

**Dica:** Sempre faça backup antes de limpar! 🛡️

