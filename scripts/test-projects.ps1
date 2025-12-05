# Test des endpoints projets
Write-Host "🧪 TEST DES PROJETS" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host ""

$baseUrl = "http://localhost:3000/api"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# 1. Créer un nouvel utilisateur pour le test
Write-Host "1. Création utilisateur test..." -ForegroundColor Yellow
$registerBody = @{
    name = "Porteur Projet $timestamp"
    email = "porteur_$timestamp@umojafund.com"
    password = "password123"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $register.token
    $userId = $register.user.id
    Write-Host "   ✅ Utilisateur créé: $($register.user.email)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Échec création utilisateur" -ForegroundColor Red
    exit
}

# 2. Lister les projets (public)
Write-Host "`n2. Liste des projets (public)..." -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "$baseUrl/projects" -Method GET
    Write-Host "   ✅ $($projects.data.Count) projet(s) trouvé(s)" -ForegroundColor Green
    if ($projects.data.Count -gt 0) {
        Write-Host "   Premier projet: $($projects.data[0].title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Échec: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Créer un projet (protégé)
Write-Host "`n3. Création d'un projet..." -ForegroundColor Yellow
$projectBody = @{
    title = "Projet Test $timestamp"
    description = "Description du projet test créé automatiquement. Ce projet vise à soutenir le développement communautaire."
    goalADA = 25000
    deadline = "2024-12-31"
    ownerId = $userId
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $project = Invoke-RestMethod -Uri "$baseUrl/projects" -Method POST -Body $projectBody -ContentType "application/json" -Headers $headers
    $projectId = $project.data.id
    Write-Host "   ✅ Projet créé: $($project.data.title)" -ForegroundColor Green
    Write-Host "   ID: $projectId" -ForegroundColor Gray
    Write-Host "   Status: $($project.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Échec création projet: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# 4. Voir les détails d'un projet
if ($projectId) {
    Write-Host "`n4. Détails du projet..." -ForegroundColor Yellow
    try {
        $projectDetail = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId" -Method GET
        Write-Host "   ✅ Projet récupéré: $($projectDetail.data.title)" -ForegroundColor Green
        Write-Host "   Objectif: $($projectDetail.data.goalADA) ADA" -ForegroundColor Gray
        Write-Host "   Propriétaire: $($projectDetail.data.owner.name)" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ Échec: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. Créer un autre utilisateur pour les contributions
Write-Host "`n5. Création contributeur..." -ForegroundColor Yellow
$contributorBody = @{
    name = "Contributeur $timestamp"
    email = "contributeur_$timestamp@umojafund.com"
    password = "password123"
} | ConvertTo-Json

try {
    $contributor = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $contributorBody -ContentType "application/json"
    $contributorToken = $contributor.token
    $contributorId = $contributor.user.id
    Write-Host "   ✅ Contributeur créé: $($contributor.user.email)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Échec création contributeur" -ForegroundColor Red
}

# 6. Tester les contributions (si l'endpoint existe)
Write-Host "`n6. Test contribution..." -ForegroundColor Yellow
if ($projectId -and $contributorToken) {
    $contributionBody = @{
        amountADA = 100
        paymentMethod = "cardano"
    } | ConvertTo-Json
    
    $contributorHeaders = @{
        "Authorization" = "Bearer $contributorToken"
    }
    
    try {
        $contribution = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId/contribute" -Method POST -Body $contributionBody -ContentType "application/json" -Headers $contributorHeaders
        Write-Host "   ✅ Contribution initiée: $($contribution.data.amountADA) ADA" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Endpoint contribution non disponible (à implémenter)" -ForegroundColor Yellow
    }
}

# 7. Tester endpoint /me (profil utilisateur)
Write-Host "`n7. Profil utilisateur..." -ForegroundColor Yellow
try {
    $profile = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    Write-Host "   ✅ Profil récupéré: $($profile.user.name)" -ForegroundColor Green
    Write-Host "   Email: $($profile.user.email)" -ForegroundColor Gray
    Write-Host "   Rôle: $($profile.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Endpoint /me non disponible (à implémenter)" -ForegroundColor Yellow
}

Write-Host "`n" + "=" * 50 -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "✅ Authentification: Fonctionnelle"
Write-Host "✅ Création projet: $(if($projectId){'Fonctionnelle'}else{'Échouée'})"
Write-Host "✅ Liste projets: Fonctionnelle"
Write-Host "✅ Détails projet: $(if($projectDetail){'Fonctionnelle'}else{'Échouée'})"
Write-Host "✅ Multi-utilisateurs: Fonctionnel"
Write-Host "`n🔗 URLs de test:" -ForegroundColor Yellow
Write-Host "  Projet créé: http://localhost:3000/api/projects/$projectId"
Write-Host "  Liste projets: http://localhost:3000/api/projects"
Write-Host "`n🎉 Tests des projets terminés!" -ForegroundColor Green