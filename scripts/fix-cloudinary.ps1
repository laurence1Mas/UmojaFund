Write-Host "🔧 Correction des problèmes Cloudinary..." -ForegroundColor Yellow

# 1. Vérifier les variables d'environnement
Write-Host "`n📋 Variables actuelles:" -ForegroundColor Cyan
$envVars = @('CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET')
foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var, 'Process')
    if ($value) {
        Write-Host "  $var = $value" -ForegroundColor Green
    } else {
        Write-Host "  $var = ❌ NON DÉFINI" -ForegroundColor Red
    }
}

# 2. Suggestions pour Cloudinary
Write-Host "`n💡 Suggestions:" -ForegroundColor Yellow
Write-Host "1. Connecte-toi à https://cloudinary.com/console"
Write-Host "2. Vérifie ton 'Cloud Name' dans le dashboard"
Write-Host "3. Regarde dans Settings > Security pour les API keys"
Write-Host "4. Mets à jour ton .env.local avec les bonnes valeurs"

# 3. Valeurs de test possibles
Write-Host "`n🔧 Valeurs de test possibles:" -ForegroundColor Cyan
Write-Host "  Cloud Name peut être comme:"
Write-Host "  - dwjapyqwu"
Write-Host "  - umojafund"
Write-Host "  - umojafund-rdc"
Write-Host "  - (vérifie ton dashboard Cloudinary)"

# 4. Pour continuer sans Cloudinary
Write-Host "`n🚀 Pour continuer SANS Cloudinary (mode développement):" -ForegroundColor Green
Write-Host "  Commenter les variables Cloudinary dans .env.local"
Write-Host "  OU les laisser vides:"
Write-Host "  CLOUDINARY_CLOUD_NAME="
Write-Host "  CLOUDINARY_API_KEY="
Write-Host "  CLOUDINARY_API_SECRET="

Write-Host "`n✅ Script terminé!" -ForegroundColor Green