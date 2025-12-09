Write-Host "🧪 Test d'authentification simple" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "test_$timestamp@umojafund.com"

Write-Host "📧 Email de test: $testEmail" -ForegroundColor Yellow
Write-Host ""

# 1. Test de santé
Write-Host "1. Test santé..." -NoNewline
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -ErrorAction Stop
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "   Message: $($health.message)" -ForegroundColor Gray
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Red
    exit
}

# 2. Inscription
Write-Host "`n2. Inscription..." -NoNewline
$registerBody = @{
    name = "Test User $timestamp"
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -ErrorAction Stop
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "   Message: $($register.message)" -ForegroundColor Gray
    Write-Host "   User ID: $($register.user.id)" -ForegroundColor Gray
    Write-Host "   Token: $($register.token.Substring(0, 20))..." -ForegroundColor Gray
    
    $token = $register.token
    $userId = $register.user.id
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Réponse: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit
}

# 3. Connexion
Write-Host "`n3. Connexion..." -NoNewline
$loginBody = @{
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "   Message: $($login.message)" -ForegroundColor Gray
    Write-Host "   Token: $($login.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test avec mauvais mot de passe
Write-Host "`n4. Test mauvais mot de passe..." -NoNewline
$badLoginBody = @{
    email = $testEmail
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $badLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $badLoginBody -ContentType "application/json" -ErrorAction Stop
    Write-Host " ❌ (devrait échouer)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host " ✅ (correctement rejeté)" -ForegroundColor Green
    } else {
        Write-Host " ❌ (code d'erreur inattendu)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Tests terminés!" -ForegroundColor Green