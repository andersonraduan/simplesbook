# Verificar e Criar Usuários no Banco

## 1️⃣ Primeiro: Verificar quais usuários existem

Execute no **phpMyAdmin** (SQL tab):

```sql
-- Ver todos os usuários
SELECT id, email, name, role, createdAt FROM User;
```

---

## 2️⃣ Opção A: Se NÃO existir usuários

Se a query acima retornar **0 rows** ou não mostrar os emails `admin@simplesbook.com` e `user@simplesbook.com`, **crie os usuários**:

```sql
-- Criar usuário Admin
INSERT INTO User (email, password, name, role, createdAt, updatedAt)
VALUES (
  'admin@simplesbook.com',
  '$2a$10$vX5kZYHJ3qL9mKp4WnR1/.rjkHhSNJp8vLY5dQX2M3FzGHJKp8ELO',
  'Administrador',
  'ADMIN',
  NOW(),
  NOW()
);

-- Criar usuário User
INSERT INTO User (email, password, name, role, createdAt, updatedAt)
VALUES (
  'user@simplesbook.com',
  '$2a$10$eDqC1YvZ8tF5hR2gJnQ3k.X9mL4pN7wK6sT2vY8cH5jM9bE1rP3Aq',
  'Usuário Teste',
  'USER',
  NOW(),
  NOW()
);
```

---

## 2️⃣ Opção B: Se existirem usuários DIFERENTES

Se você vir outros emails (por exemplo, `admin@clinicalasante.pt`), me diga quais são e eu gero os comandos UPDATE corretos para esses emails.

---

## 3️⃣ Depois de executar

**Teste o login:**
- Admin: `admin@simplesbook.com` / `admin123`
- User: `user@simplesbook.com` / `user123`

---

**Execute a query SELECT primeiro** e me diga o resultado! 📊
