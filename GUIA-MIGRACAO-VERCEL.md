# 🚀 Guia de Migração: cPanel → Vercel

## ✅ Por Que Vercel?

- ✅ **Gratuito** para projetos pessoais/hobby
- ✅ **Otimizado** para Next.js (mesma empresa!)
- ✅ **Deploys automáticos** via Git
- ✅ **Todas as features funcionam** (API Routes, Middleware, etc.)
- ✅ **SSL/HTTPS automático**
- ✅ **CDN global** incluso

---

## 📋 Pré-requisitos

1. Conta no GitHub (gratuita)
2. Conta no Vercel (gratuita)
3. Seu banco MySQL acessível pela internet

---

## 🗄️ Opção 1: Manter MySQL Atual (RECOMENDADO)

Se seu banco MySQL do cPanel for acessível pela internet:

### Passo 1: Habilitar Acesso Remoto

No cPanel:
1. **MySQL® Remote Database Access**
2. Adicionar host: `%` (todos) ou IPs da Vercel
3. Anote: host, porta, usuário, senha, nome do banco

### Passo 2: Testar Conexão

```bash
# No seu computador
mysql -h SEU_HOST -u SEU_USUARIO -p NOME_BANCO
```

Se conectar = pode usar com Vercel!

---

## 🗄️ Opção 2: Migrar para Vercel Postgres

Se preferir banco gerenciado pela Vercel:

### Custo
- **Gratuito:** 256MB, 60h compute/mês
- **Pago:** $20/mês - 512MB, compute ilimitado

### Migração de Dados

```bash
# 1. Exportar do MySQL atual
mysqldump -h HOST -u USER -p BANCO > backup.sql

# 2. Após criar Vercel Postgres, importar:
psql -h VERCEL_HOST -U VERCEL_USER -d VERCEL_DB < backup-convertido.sql
```

⚠️ **Atenção:** Precisará converter SQL de MySQL para PostgreSQL

---

## 🚀 Deploy no Vercel - Passo a Passo

### 1️⃣ Preparar Projeto

```bash
cd C:\Users\ander\Desktop\simplesbook

# Criar repositório Git (se ainda não tiver)
git init
git add .
git commit -m "Preparar para deploy na Vercel"
```

### 2️⃣ Enviar para GitHub

1. Vá em: https://github.com/new
2. Nome: `simplesbook`
3. **NÃO** marque "Initialize with README"
4. Criar repositório
5. Execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/simplesbook.git
git branch -M main
git push -u origin main
```

### 3️⃣ Conectar no Vercel

1. Acesse: https://vercel.com
2. **Sign Up** com GitHub
3. **New Project**
4. **Import** o repositório `simplesbook`
5. **Configure:**
   - Framework Preset: **Next.js** ✅ (auto-detectado)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Install Command: `npm install`

### 4️⃣ Configurar Variáveis de Ambiente

No Vercel, **Environment Variables**:

```bash
# Banco de Dados
DATABASE_URL="mysql://usuario:senha@host:porta/banco"

# NextAuth
NEXTAUTH_SECRET="seu-secret-atual"
NEXTAUTH_URL="https://seu-app.vercel.app"

# Twilio (se usar)
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="..."

# Node
NODE_ENV="production"
```

⚠️ **Importante:** 
- `NEXTAUTH_URL` será gerado pela Vercel (ex: `simplesbook.vercel.app`)
- Copie do seu `.env` atual

### 5️⃣ Deploy!

Clique **Deploy** → Aguarde 1-2 minutos

---

## ✅ Após Deploy

### Testar

1. Acesse: `https://seu-app.vercel.app`
2. Teste login: `admin@simplesbook.com` / `admin123`
3. Verifique se redireciona para dashboard

### Configurar Domínio Próprio (Opcional)

1. Vercel → Settings → Domains
2. Adicionar: `calendario.clinicalasante.pt`
3. Configurar DNS:
   - **CNAME:** `cname.vercel-dns.com`
   - Ou **A Record:** IP fornecido pela Vercel

---

## 🔧 Ajustes Necessários

### Remover Código Específico do cPanel

Edite `next.config.js`:

```javascript
const nextConfig = {
  compress: true,
  
  // REMOVER isso (era para cPanel):
  // experimental: {
  //   workerThreads: false,
  //   cpus: 1,
  // },
  
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Headers de segurança permanecem
  async headers() {
    // ... manter
  },
};
```

### Remover Arquivos Desnecessários

```bash
# Deletar (não são mais necessários):
rm server.js
rm app.js
rm .htaccess
rm start.sh
```

### Atualizar `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",  // ← Voltar para next start padrão
    "lint": "next lint"
  }
}
```

---

## 📊 Comparação

| Feature | cPanel | Vercel |
|---------|--------|--------|
| **Custo** | ~R$ 30/mês | Grátis |
| **APIs funcionam** | ❌ | ✅ |
| **Deploy** | Manual (FTP) | Automático (Git) |
| **SSL** | Manual | Automático |
| **Performance** | Lenta | Rápida (Edge) |
| **Suporte Next.js** | Limitado | Nativo |

---

## 🎯 Checklist de Migração

- [ ] Backup completo do banco de dados
- [ ] Testar acesso remoto ao MySQL
- [ ] Criar repositório GitHub
- [ ] Push do código
- [ ] Criar conta Vercel
- [ ] Importar projeto
- [ ] Configurar variáveis de ambiente
- [ ] Deploy
- [ ] Testar login
- [ ] Configurar domínio (opcional)
- [ ] Cancelar hospedagem cPanel (após confirmar funcionamento)

---

## ❓ Dúvidas Comuns

### "E o meu banco de dados?"

**Opção A:** Manter MySQL do cPanel (se acessível remotamente)  
**Opção B:** Migrar para Vercel Postgres (~20€/mês)  
**Opção C:** PlanetScale MySQL (gratuito até 5GB)

### "Preciso pagar?"

Não! Vercel é **100% gratuito** para hobby. Limites:
- 100GB bandwidth/mês
- Unlimited deploys
- Serverless functions ilimitadas

### "E se eu ultrapassar os limites?"

Improvável para um projeto pequeno. Se acontecer:
- Vercel Pro: $20/mês
- Ainda mais barato que cPanel!

---

## 🆘 Precisa de Ajuda?

1. **Deploy com erro?** 
   - Veja logs no Vercel Dashboard
   - Me mostre o erro

2. **Banco não conecta?**
   - Verifique `DATABASE_URL`
   - Teste conexão remota

3. **NextAuth não funciona?**
   - Verifique `NEXTAUTH_URL` e `NEXTAUTH_SECRET`

---

## ✨ Próximos Passos

Após confirmar que funciona na Vercel:

1. Atualizar DNS para apontar para Vercel
2. Aguardar propagação (24-48h)
3. Testar com domínio próprio
4. **Cancelar cPanel!** 💰

---

**Pronto para começar?** Me avise quando criar o repositório no GitHub que te ajudo com o resto! 🚀
