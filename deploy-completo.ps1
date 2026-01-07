# Script Completo de Deploy - SimplesBook
# Execute este script no seu computador Windows

Write-Host "Deploy Completo - SimplesBook" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se esta na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "1. Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Dependencias instaladas" -ForegroundColor Green
Write-Host ""

Write-Host "2. Gerando Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao gerar Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Prisma Client gerado" -ForegroundColor Green
Write-Host ""

Write-Host "3. Fazendo build da aplicacao..." -ForegroundColor Yellow
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao fazer build" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Build concluido!" -ForegroundColor Green
Write-Host ""

Write-Host "4. Criando arquivo ZIP para deploy..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$zipName = "deploy-$timestamp.zip"

$filesToZip = @(
    ".next",
    "prisma",
    "public",
    "src",
    "package.json",
    "next.config.js",
    "tsconfig.json",
    "server.js",
    "ecosystem.config.js",
    ".htaccess.proxy"
)

$existingFiles = @()
foreach ($item in $filesToZip) {
    if (Test-Path $item) {
        $existingFiles += $item
    } else {
        Write-Host "AVISO: $item nao encontrado (pode ser opcional)" -ForegroundColor Yellow
    }
}

if ($existingFiles.Count -eq 0) {
    Write-Host "ERRO: Nenhum arquivo encontrado!" -ForegroundColor Red
    exit 1
}

try {
    Compress-Archive -Path $existingFiles -DestinationPath $zipName -Force
    $zipSize = (Get-Item $zipName).Length / 1MB
    Write-Host "OK - Arquivo ZIP criado: $zipName" -ForegroundColor Green
    Write-Host "Tamanho: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
} catch {
    Write-Host "ERRO ao criar ZIP: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "PRONTO PARA DEPLOY!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Envie o arquivo '$zipName' via FTP para o servidor" -ForegroundColor White
Write-Host "2. No servidor, execute os comandos abaixo:" -ForegroundColor White
Write-Host ""
Write-Host "   cd ~/calendario.clinicalasante.pt" -ForegroundColor Gray
Write-Host "   unzip deploy-*.zip -d ." -ForegroundColor Gray
Write-Host "   cp .htaccess.proxy .htaccess" -ForegroundColor Gray
Write-Host "   chmod -R 755 ." -ForegroundColor Gray
Write-Host "   npm install --production" -ForegroundColor Gray
Write-Host "   npm install -g pm2" -ForegroundColor Gray
Write-Host "   npm run db:generate" -ForegroundColor Gray
Write-Host "   npx prisma migrate deploy" -ForegroundColor Gray
Write-Host "   pm2 start ecosystem.config.js" -ForegroundColor Gray
Write-Host "   pm2 save" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Acesse: https://calendario.clinicalasante.pt" -ForegroundColor White
Write-Host ""

