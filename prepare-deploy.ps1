# SimplesBook - Script de Preparação para Deploy (Windows PowerShell)
# Uso: .\prepare-deploy.ps1

Write-Host "🚀 Preparando arquivos para deploy..." -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js não encontrado. Instale em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar se npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✓ npm detectado: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. Verificando build..." -ForegroundColor Yellow

# Verificar se .next existe
if (Test-Path ".next") {
    Write-Host "   ✓ Build encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Build não encontrado. Executando npm run build..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Build concluído" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Erro ao fazer build" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "2. Gerando Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Prisma Client gerado" -ForegroundColor Green
} else {
    Write-Host "   ✗ Erro ao gerar Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Criando pasta de deploy..." -ForegroundColor Yellow

$deployDir = "deploy-package"
if (Test-Path $deployDir) {
    Remove-Item -Path $deployDir -Recurse -Force
}
New-Item -Path $deployDir -ItemType Directory | Out-Null
Write-Host "   ✓ Pasta criada: $deployDir\" -ForegroundColor Green

Write-Host ""
Write-Host "4. Copiando arquivos..." -ForegroundColor Yellow

# Arquivos individuais
$files = @(
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "ecosystem.config.js",
    "cron-scheduler.js",
    "env.example"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $dest = if ($file -eq "env.example") { ".env.example" } else { $file }
        Copy-Item -Path $file -Destination "$deployDir\$dest"
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $file não encontrado (pode ser opcional)" -ForegroundColor Yellow
    }
}

# Diretórios
$dirs = @(
    @{src=".next"; dest=".next"},
    @{src="prisma"; dest="prisma"},
    @{src="public"; dest="public"},
    @{src="src"; dest="src"}
)

foreach ($dir in $dirs) {
    if (Test-Path $dir.src) {
        # Copiar diretório, excluindo node_modules e cache
        robocopy $dir.src "$deployDir\$($dir.dest)" /E /XD node_modules cache .git /NFL /NDL /NJH /NJS | Out-Null
        Write-Host "   ✓ $($dir.src)\" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $($dir.src)\ não encontrado" -ForegroundColor Yellow
    }
}

# Criar pasta logs
New-Item -Path "$deployDir\logs" -ItemType Directory -Force | Out-Null
Write-Host "   ✓ logs\" -ForegroundColor Green

Write-Host ""
Write-Host "5. Criando instruções de deploy..." -ForegroundColor Yellow

$readmeContent = @"
# Instruções de Deploy

## Arquivos Preparados

Esta pasta contém todos os arquivos necessários para fazer o deploy via FTP.

## Próximos Passos

1. **Configure o arquivo .env**
   - Copie .env.example para .env
   - Preencha todas as variáveis de ambiente
   - Gere um NEXTAUTH_SECRET seguro

2. **Envie via FTP**
   - Conecte-se ao seu servidor FTP
   - Envie todos os arquivos desta pasta
   - Mantenha a estrutura de diretórios

3. **No Servidor (via SSH)**
   
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

4. **Verificar**
   
   pm2 status
   pm2 logs simplesbook

## Documentação Completa

Consulte os arquivos:
- DEPLOYMENT.md - Guia completo de deployment
- QUICK_DEPLOY.md - Checklist rápido
- PRODUCAO_FTP.md - Resumo executivo

## Suporte

Em caso de problemas, verifique:
1. Logs: pm2 logs simplesbook
2. Status: pm2 status
3. Conexão banco: npx prisma db pull

Data de preparação: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
"@

Set-Content -Path "$deployDir\README-DEPLOY.txt" -Value $readmeContent
Write-Host "   ✓ README-DEPLOY.txt criado" -ForegroundColor Green

Write-Host ""
Write-Host "6. Criando arquivo comprimido..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyy-MM-dd"
$zipName = "simplesbook-deploy-$timestamp.zip"

try {
    Compress-Archive -Path "$deployDir\*" -DestinationPath $zipName -Force
    Write-Host "   ✓ Arquivo criado: $zipName" -ForegroundColor Green
    
    $zipSize = (Get-Item $zipName).Length / 1MB
    Write-Host "   ℹ️  Tamanho: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
} catch {
    Write-Host "   ⚠️  Não foi possível criar arquivo comprimido" -ForegroundColor Yellow
    Write-Host "   ℹ️  Use a pasta $deployDir\ diretamente" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ Preparação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Configure o arquivo .env (copie de env.example)" -ForegroundColor White
Write-Host "   2. Envie os arquivos via FTP" -ForegroundColor White
Write-Host "   3. Execute os comandos no servidor" -ForegroundColor White
Write-Host ""
Write-Host "📖 Leia:" -ForegroundColor Cyan
Write-Host "   - PRODUCAO_FTP.md (resumo executivo)" -ForegroundColor White
Write-Host "   - DEPLOYMENT.md (guia completo)" -ForegroundColor White
Write-Host "   - QUICK_DEPLOY.md (checklist rápido)" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

