# Script de test direct
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "test_$timestamp@umojafund.com"

Write-Host "🧪 Test IMMÉDIAT - Email: $testEmail" -ForegroundColor Cyan

# 1. Inscription
$registerBody = @{
    name = "Test User $timestamp"
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

Write-Host "`n1. Inscription..." -ForegroundColor Yellow
try {
    $register = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "   ✅ SUCCÈS!" -ForegroundColor Green
    Write-Host "   Message: $($register.message)" -ForegroundColor Gray
    Write-Host "   User ID: $($register.user.id)" -ForegroundColor Gray
    Write-Host "   Token: $($register.token.Substring(0, 30))..." -ForegroundColor Gray
    
    $token = $register.token
} catch {
    Write-Host "   ❌ ÉCHEC" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit
}

# 2. Connexion
Write-Host "`n2. Connexion..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "   ✅ SUCCÈS!" -ForegroundColor Green
    Write-Host "   Message: $($login.message)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ ÉCHEC" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test avec mauvais mot de passe
Write-Host "`n3. Test mauvais mot de passe..." -ForegroundColor Yellow
$badLoginBody = @{
    email = $testEmail
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $badLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $badLoginBody -ContentType "application/json"
    Write-Host "   ❌ ÉCHEC (devrait échouer!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "   ✅ CORRECT (rejeté comme prévu)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Code d'erreur inattendu: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 TEST TERMINÉ!" -ForegroundColor Green