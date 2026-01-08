# 🧪 Testes na Vercel - SimplesBook

## 1️⃣ Testar API Health

Abra no navegador ou terminal:

```bash
# Substitua SEU_DOMINIO pelo domínio da Vercel (ex: simplesbook.vercel.app)
curl https://SEU_DOMINIO/api/health
```

**Esperado:** JSON com `{"status": "ok", ...}`

---

## 2️⃣ Testar Conexão com Banco

```bash
curl https://SEU_DOMINIO/api/reset-users?secret=RESETAR123
```

**Se funcionar:** Vai resetar as senhas para:
- `admin@simplesbook.com` → `admin123`
- `user@simplesbook.com` → `user123`

**Se der erro:** Me mostre a mensagem

---

## 3️⃣ Testar Login

Depois de resetar senhas:

1. Acesse: `https://SEU_DOMINIO/login`
2. Email: `admin@simplesbook.com`
3. Senha: `admin123`
4. Clique em "Entrar"

**Esperado:** Redireciona para `/admin/dashboard`

---

## 4️⃣ Verificar Variáveis de Ambiente

Na Vercel, certifique-se de ter:

```env
DATABASE_URL=mysql://clini489_simplesbook:Sib5r3fjC%25iKaLf6@185.12.116.162:3306/clini489_simplesbook
NEXTAUTH_SECRET=(seu secret)
NEXTAUTH_URL=https://SEU_DOMINIO.vercel.app
TWILIO_ACCOUNT_SID=(seu sid)
TWILIO_AUTH_TOKEN=(seu token)
TWILIO_PHONE_NUMBER=(seu numero)
NODE_ENV=production
```

---

## 📝 Comandos de Teste

Execute estes comandos substituindo `SEU_DOMINIO`:

```bash
# 1. Health check
curl https://SEU_DOMINIO/api/health

# 2. Reset senhas
curl "https://SEU_DOMINIO/api/reset-users?secret=RESETAR123"

# 3. Ver resposta completa
curl -v "https://SEU_DOMINIO/api/reset-users?secret=RESETAR123"
```

---

**Me mostre:**
1. Qual é o domínio da Vercel?
2. O que retorna `/api/health`?
3. O que retorna `/api/reset-users`?
