# 🔐 Corrigir Erro 500 - NextAuth Session

## 🎯 Problema Identificado

Erro: `GET /api/auth/session 500 (Internal Server Error)`
Causa: **Variáveis de ambiente do NextAuth não carregadas pelo PM2**

---

## ✅ Solução Completa

### **PASSO 1: Criar arquivo .env no servidor**

Execute no servidor via SSH:

```bash
cd ~/calendario.clinicalasante.pt
```

Agora crie/edite o arquivo `.env`:

```bash
nano .env
```

Cole o conteúdo abaixo, **substituindo os valores pelos reais**:

```env
# Database
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"

# NextAuth - CRÍTICO!
NEXTAUTH_SECRET="gere-uma-string-aleatoria-segura-de-32-caracteres-ou-mais"
NEXTAUTH_URL="https://calendario.clinicalasante.pt"

# Twilio (notificações SMS/WhatsApp)
TWILIO_ACCOUNT_SID="seu_account_sid_aqui"
TWILIO_AUTH_TOKEN="seu_auth_token_aqui"
TWILIO_PHONE_NUMBER="+5511999999999"
TWILIO_WHATSAPP_NUMBER="whatsapp:+5511999999999"

# App Config
NEXT_PUBLIC_APP_NAME="SimplesBook"
NEXT_PUBLIC_APP_URL="https://calendario.clinicalasante.pt"

# Node Environment
NODE_ENV="production"
```

**Para gerar um NEXTAUTH_SECRET seguro**, use:

```bash
openssl rand -base64 32
```

Salve o arquivo: `Ctrl+O` → `Enter` → `Ctrl+X`

---

### **PASSO 2: Verificar permissões do .env**

```bash
chmod 600 .env
chown clini489:clini489 .env
```

---

### **PASSO 3: Atualizar ecosystem.config.js**

O arquivo `ecosystem.config.js` já foi atualizado para carregar o `.env` automaticamente.

**Faça upload do novo `ecosystem.config.js` para o servidor:**

```bash
# No seu PC (PowerShell/Terminal local)
# Substitua pelo caminho correto do seu FTP/SFTP
scp ecosystem.config.js usuario@servidor:~/calendario.clinicalasante.pt/
```

---

### **PASSO 4: Reiniciar PM2 com novas configurações**

Execute no servidor:

```bash
cd ~/calendario.clinicalasante.pt

# Parar processo atual
pm2 stop simplesbook
pm2 delete simplesbook

# Recarregar com novo ecosystem.config.js
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Ver logs em tempo real
pm2 logs simplesbook --lines 20
```

---

### **PASSO 5: Verificar se funcionou**

#### 1. Verificar logs do PM2:

```bash
pm2 logs simplesbook --lines 30 --nostream
```

**Não deve aparecer:**
```
⚠️ NEXTAUTH_SECRET não está definido!
```

#### 2. Testar endpoint de sessão:

```bash
curl -I https://calendario.clinicalasante.pt/api/auth/session
```

**Deve retornar:**
```
HTTP/2 200
```

#### 3. Testar no navegador:

Acesse: `https://calendario.clinicalasante.pt/login`

O erro 500 deve ter desaparecido.

---

## 🔍 Se ainda der erro

### Verificar se variáveis foram carregadas:

```bash
pm2 describe simplesbook | grep -A 20 "env:"
```

### Ver logs de erro detalhados:

```bash
pm2 logs simplesbook --err --lines 50
```

### Testar carregamento manual:

```bash
cd ~/calendario.clinicalasante.pt

# Carregar .env e testar
export $(cat .env | xargs)
echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:10}..." # Mostra primeiros 10 chars
echo "DATABASE_URL: ${DATABASE_URL%%\?*}" # Mostra sem query params
```

---

## 📝 O que foi corrigido

1. ✅ **ecosystem.config.js** - Configurado para carregar `.env` automaticamente
2. ✅ **.env** - Criado com todas variáveis necessárias  
3. ✅ **Permissões** - `.env` protegido (600)
4. ✅ **PM2** - Reiniciado com novas configurações

---

## ⚠️ SEGURANÇA

- ❌ **NUNCA** commitar o arquivo `.env` no Git
- ❌ **NUNCA** compartilhar `NEXTAUTH_SECRET` publicamente
- ✅ **Sempre** usar `chmod 600` no `.env`
- ✅ **Sempre** gerar secrets aleatórios com `openssl rand -base64 32`

---

**Execute os passos acima e me envie o resultado do PASSO 5!** 🚀

