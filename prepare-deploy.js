#!/usr/bin/env node

/**
 * Script para preparar os arquivos para deploy via FTP
 * 
 * Uso: node prepare-deploy.js
 * 
 * Cria um arquivo comprimido com todos os arquivos necessários
 * para fazer o deploy via FTP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparando arquivos para deploy...\n');

// Verificar se o build existe
console.log('1. Verificando build...');
if (!fs.existsSync('.next')) {
  console.log('   ⚠️  Build não encontrado. Executando npm run build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('   ✓ Build concluído');
  } catch (error) {
    console.error('   ✗ Erro ao fazer build');
    process.exit(1);
  }
} else {
  console.log('   ✓ Build encontrado');
}

// Verificar se o Prisma Client foi gerado
console.log('\n2. Verificando Prisma Client...');
try {
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('   ✓ Prisma Client gerado');
} catch (error) {
  console.error('   ✗ Erro ao gerar Prisma Client');
  process.exit(1);
}

// Criar pasta de deploy
console.log('\n3. Criando pasta de deploy...');
const deployDir = path.join(__dirname, 'deploy-package');
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir);
console.log('   ✓ Pasta criada: deploy-package/');

// Copiar arquivos necessários
console.log('\n4. Copiando arquivos...');

const filesToCopy = [
  { src: 'package.json', dest: 'package.json' },
  { src: 'package-lock.json', dest: 'package-lock.json' },
  { src: 'next.config.ts', dest: 'next.config.ts' },
  { src: 'tsconfig.json', dest: 'tsconfig.json' },
  { src: 'ecosystem.config.js', dest: 'ecosystem.config.js' },
  { src: 'cron-scheduler.js', dest: 'cron-scheduler.js' },
  { src: 'env.example', dest: '.env.example' },
];

const dirsTooCopy = [
  { src: '.next', dest: '.next' },
  { src: 'prisma', dest: 'prisma' },
  { src: 'public', dest: 'public' },
  { src: 'src', dest: 'src' },
];

// Copiar arquivos individuais
filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(deployDir, dest));
    console.log(`   ✓ ${src}`);
  } else {
    console.log(`   ⚠️  ${src} não encontrado (pode ser opcional)`);
  }
});

// Função para copiar diretórios recursivamente
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Pular node_modules e cache
      if (entry.name === 'node_modules' || entry.name === 'cache') {
        continue;
      }
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copiar diretórios
dirsTooCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    copyDir(src, path.join(deployDir, dest));
    console.log(`   ✓ ${src}/`);
  } else {
    console.log(`   ⚠️  ${src}/ não encontrado`);
  }
});

// Criar pasta logs
fs.mkdirSync(path.join(deployDir, 'logs'), { recursive: true });
console.log('   ✓ logs/');

// Criar README de deploy
console.log('\n5. Criando instruções de deploy...');
const readmeContent = `# Instruções de Deploy

## Arquivos Preparados

Esta pasta contém todos os arquivos necessários para fazer o deploy via FTP.

## Próximos Passos

1. **Configure o arquivo .env**
   - Copie \`.env.example\` para \`.env\`
   - Preencha todas as variáveis de ambiente
   - Gere um NEXTAUTH_SECRET: \`openssl rand -base64 32\`

2. **Envie via FTP**
   - Conecte-se ao seu servidor FTP
   - Envie todos os arquivos desta pasta
   - Mantenha a estrutura de diretórios

3. **No Servidor (via SSH)**
   \`\`\`bash
   # Instalar dependências
   npm install --production
   
   # Configurar banco de dados
   npx prisma migrate deploy
   npm run db:seed
   
   # Instalar PM2
   npm install -g pm2
   
   # Iniciar aplicação
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   
   # Configurar CRON
   crontab -e
   # Adicionar: */10 * * * * cd ~/simplesbook && node cron-scheduler.js >> ~/simplesbook/logs/cron.log 2>&1
   \`\`\`

4. **Verificar**
   \`\`\`bash
   pm2 status
   pm2 logs simplesbook
   \`\`\`

## Documentação Completa

Consulte os arquivos:
- DEPLOYMENT.md - Guia completo de deployment
- QUICK_DEPLOY.md - Checklist rápido

## Suporte

Em caso de problemas, verifique:
1. Logs: \`pm2 logs simplesbook\`
2. Status: \`pm2 status\`
3. Conexão banco: \`npx prisma db pull\`

Data de preparação: ${new Date().toLocaleString('pt-BR')}
`;

fs.writeFileSync(path.join(deployDir, 'README-DEPLOY.txt'), readmeContent);
console.log('   ✓ README-DEPLOY.txt criado');

// Compactar (opcional - requer tar)
console.log('\n6. Criando arquivo comprimido...');
try {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const zipName = `simplesbook-deploy-${timestamp}.tar.gz`;
  
  execSync(`tar -czf ${zipName} -C deploy-package .`, { stdio: 'inherit' });
  console.log(`   ✓ Arquivo criado: ${zipName}`);
  
  // Mostrar tamanho
  const stats = fs.statSync(zipName);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   ℹ️  Tamanho: ${sizeMB} MB`);
} catch (error) {
  console.log('   ⚠️  Não foi possível criar arquivo comprimido (tar não disponível)');
  console.log('   ℹ️  Use a pasta deploy-package/ diretamente');
}

console.log('\n✅ Preparação concluída!');
console.log('\n📦 Próximos passos:');
console.log('   1. Configure o arquivo .env (copie de .env.example)');
console.log('   2. Envie os arquivos via FTP');
console.log('   3. Execute os comandos no servidor');
console.log('\n📖 Leia: DEPLOYMENT.md e QUICK_DEPLOY.md');

