# Comando para zipar arquivos de deploy
# Uso: .\zip-deploy.ps1

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$zipName = "deploy-$timestamp.zip"

Write-Host "📦 Comprimindo arquivos para deploy..." -ForegroundColor Cyan

# Criar arquivo ZIP com os arquivos necessários
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

# Verificar quais arquivos existem
$existingFiles = @()
foreach ($item in $filesToZip) {
    if (Test-Path $item) {
        $existingFiles += $item
        Write-Host "✓ $item" -ForegroundColor Green
    } else {
        Write-Host "⚠ $item não encontrado" -ForegroundColor Yellow
    }
}

if ($existingFiles.Count -eq 0) {
    Write-Host "❌ Nenhum arquivo encontrado para comprimir!" -ForegroundColor Red
    exit 1
}

# Comprimir
try {
    Compress-Archive -Path $existingFiles -DestinationPath $zipName -Force
    $zipSize = (Get-Item $zipName).Length / 1MB
    Write-Host ""
    Write-Host "✅ Arquivo criado: $zipName" -ForegroundColor Green
    Write-Host "📊 Tamanho: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro ao criar arquivo ZIP: $_" -ForegroundColor Red
    exit 1
}

