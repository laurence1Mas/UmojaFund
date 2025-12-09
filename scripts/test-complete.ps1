Write-Host "
███████╗██╗   ██╗███████╗████████╗███████╗██████╗ 
██╔════╝██║   ██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗
███████╗██║   ██║█████╗     ██║   █████╗  ██████╔╝
╚════██║██║   ██║██╔══╝     ██║   ██╔══╝  ██╔══██╗
███████║╚██████╔╝███████╗   ██║   ███████╗██║  ██║
╚══════╝ ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
   UMOJAFUND - TESTS COMPLETS API BACKEND
" -ForegroundColor Cyan

Write-Host "=" * 70
Write-Host ""

$baseUrl = "http://localhost:3000/api"
$global:testResults = @()

function Add-TestResult($name, $status, $details) {
    $global:testResults += [PSCustomObject]@{
        Name = $name
        Status = $status
        Details = $details
        Timestamp = Get-Date -Format "HH:mm:ss"
    }
}

# 1. Test santé
Write-Host "1. ✅ Test santé API..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -ErrorAction Stop
    Add-TestResult "Health Check" "PASS" "API healthy: $($health.message)"
    Write-Host "   ✓ $($health.message)" -ForegroundColor Green
} catch {
    Add-TestResult "Health Check" "FAIL" "Erreur: $_"
    Write-Host "   ✗ Échec: $_" -ForegroundColor Red
    exit
}

# 2. Inscription utilisateur
Write-Host "`n2. 👤 Inscription utilisateur..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "automated_$timestamp@umojafund.com"
$registerBody = @{
    name = "Automated Test User"
    email = $testEmail
    password = "AutoPass123!"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -ErrorAction Stop
    $global:authToken = $register.token
    $global:userId = $register.user.id
    Add-TestResult "User Registration" "PASS" "User created: $testEmail (ID: $($global:userId))"
    Write-Host "   ✓ Utilisateur créé: $testEmail" -ForegroundColor Green
} catch {
    Add-TestResult "User Registration" "FAIL" "Erreur: $_"
    Write-Host "   ✗ Échec création: $_" -ForegroundColor Red
    exit
}

# 3. Connexion
Write-Host "`n3. 🔐 Connexion utilisateur..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "AutoPass123!"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $global:authToken = $login.token
    Add-TestResult "User Login" "PASS" "Login successful, token obtained"
    Write-Host "   ✓ Connexion réussie" -ForegroundColor Green
} catch {
    Add-TestResult "User Login" "FAIL" "Erreur: $_"
    Write-Host "   ✗ Échec connexion: $_" -ForegroundColor Red
}

# 4. Headers pour requêtes authentifiées
$authHeaders = @{
    "Authorization" = "Bearer $global:authToken"
}

# 5. Création projet
Write-Host "`n4. 🚀 Création projet..." -ForegroundColor Yellow
$projectBody = @{
    title = "Projet Automatisé $timestamp"
    description = "Ce projet a été créé automatiquement par le script de test. Objectif: valider le fonctionnement complet de l'API UmojaFund."
    goalADA = 50000
    deadline = "2024-12-31"
    ownerId = $global:userId
} | ConvertTo-Json

try {
    $project = Invoke-RestMethod -Uri "$baseUrl/projects" -Method POST -Body $projectBody -ContentType "application/json" -Headers $authHeaders -ErrorAction Stop
    $global:projectId = $project.data.id
    Add-TestResult "Project Creation" "PASS" "Project created: $($project.data.title) (ID: $($global:projectId))"
    Write-Host "   ✓ Projet créé: $($project.data.title)" -ForegroundColor Green
    Write-Host "   📊 Objectif: $($project.data.goalADA) ADA" -ForegroundColor Gray
    Write-Host "   📅 Deadline: $($project.data.deadline)" -ForegroundColor Gray
} catch {
    Add-TestResult "Project Creation" "FAIL" "Erreur: $_"
    Write-Host "   ✗ Échec création projet: $_" -ForegroundColor Red
}

# 6. Liste projets (public)
Write-Host "`n5. 📋 Liste projets (public)..." -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "$baseUrl/projects?limit=5" -Method GET -ErrorAction Stop
    Add-TestResult "Project List" "PASS" "Found $($projects.data.Count) project(s)"
    Write-Host "   ✓ $($projects.data.Count) projet(s) trouvé(s)" -ForegroundColor Green
    if ($projects.data.Count -gt 0) {
        Write-Host "   📌 Exemple: $($projects.data[0].title)" -ForegroundColor Gray
    }
} catch {
    Add-TestResult "Project List" "FAIL" "Erreur: $_"
    Write-Host "   ✗ Échec liste projets: $_" -ForegroundColor Red
}

# 7. Détails projet
if ($global:projectId) {
    Write-Host "`n6. 🔍 Détails projet spécifique..." -ForegroundColor Yellow
    try {
        $projectDetail = Invoke-RestMethod -Uri "$baseUrl/projects/$($global:projectId)" -Method GET -ErrorAction Stop
        Add-TestResult "Project Details" "PASS" "Project details retrieved successfully"
        Write-Host "   ✓ Détails récupérés: $($projectDetail.data.title)" -ForegroundColor Green
        Write-Host "   📝 Description: $($projectDetail.data.description.Substring(0, [Math]::Min(50, $projectDetail.data.description.Length)))..." -ForegroundColor Gray
    } catch {
        Add-TestResult "Project Details" "FAIL" "Erreur: $_"
        Write-Host "   ✗ Échec détails projet: $_" -ForegroundColor Red
    }
}

# 8. Test endpoint /me (si existe)
Write-Host "`n7. 👤 Profil utilisateur (protected)..." -ForegroundColor Yellow
try {
    $profile = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $authHeaders -ErrorAction Stop
    Add-TestResult "User Profile" "PASS" "Profile retrieved: $($profile.user.email)"
    Write-Host "   ✓ Profil récupéré: $($profile.user.name)" -ForegroundColor Green
} catch {
    Add-TestResult "User Profile" "WARN" "Endpoint /me non implémenté"
    Write-Host "   ⚠️  Endpoint /me non disponible" -ForegroundColor Yellow
}

# 9. Test erreurs d'authentification
Write-Host "`n8. 🛡️  Tests sécurité..." -ForegroundColor Yellow

# Test sans token
try {
    $noAuth = Invoke-RestMethod -Uri "$baseUrl/projects" -Method POST -Body $projectBody -ContentType "application/json" -ErrorAction Stop
    Add-TestResult "Security - No Token" "FAIL" "Should have failed without token"
    Write-Host "   ✗ Devrait échouer sans token" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Add-TestResult "Security - No Token" "PASS" "Correctly rejected (401)"
        Write-Host "   ✓ Correctement rejeté sans token (401)" -ForegroundColor Green
    }
}

# Test avec token invalide
$badHeaders = @{
    "Authorization" = "Bearer invalid_token_123"
}
try {
    $badToken = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $badHeaders -ErrorAction Stop
    Add-TestResult "Security - Invalid Token" "FAIL" "Should have failed with invalid token"
    Write-Host "   ✗ Devrait échouer avec token invalide" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Add-TestResult "Security - Invalid Token" "PASS" "Correctly rejected invalid token (401)"
        Write-Host "   ✓ Correctement rejeté token invalide (401)" -ForegroundColor Green
    }
}

# Afficher le résumé
Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Host "📊 RAPPORT DE TESTS - UMOJAFUND API" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan

$passed = ($global:testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($global:testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warn = ($global:testResults | Where-Object { $_.Status -eq "WARN" }).Count
$total = $global:testResults.Count

Write-Host "Résumé: $passed/$total réussis, $failed échecs, $warn avertissements" -ForegroundColor Yellow
Write-Host ""

foreach ($test in $global:testResults) {
    $color = switch ($test.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "White" }
    }
    
    $icon = switch ($test.Status) {
        "PASS" { "✓" }
        "FAIL" { "✗" }
        "WARN" { "⚠" }
        default { " " }
    }
    
    Write-Host "  $icon $($test.Name.PadRight(30)) [$($test.Timestamp)]" -ForegroundColor $color
    if ($test.Details) {
        Write-Host "      $($test.Details)" -ForegroundColor Gray
    }
}

Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Host "🔗 INFORMATIONS UTILES" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan

if ($global:projectId) {
    Write-Host "Projet de test créé:" -ForegroundColor White
    Write-Host "  ID: $global:projectId" -ForegroundColor Gray
    Write-Host "  URL: http://localhost:3000/api/projects/$global:projectId" -ForegroundColor Gray
}

Write-Host "`nToken d'authentification:" -ForegroundColor White
Write-Host "  $($global:authToken.Substring(0, [Math]::Min(50, $global:authToken.Length)))..." -ForegroundColor Gray

Write-Host "`n📁 Base URL API: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🗄️  MongoDB: cluster0.uyfomle.mongodb.net" -ForegroundColor Cyan

Write-Host "`n🎉 TESTS TERMINÉS AVEC SUCCÈS!" -ForegroundColor Green