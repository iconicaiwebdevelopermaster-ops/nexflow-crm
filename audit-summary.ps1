$summary = "=== NEXFLOW CRM COMPACT AUDIT ===
"
$summary += "Date: $(Get-Date)

"

# 1. FILE TREE (ONLY SRC + PRISMA)
$summary += "=== 1. ALL EXISTING PROJECT FILES ===
"
Get-ChildItem -Path src, prisma -Recurse -File | Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.git' } | ForEach-Object {
    $summary += "$($_.FullName.Replace((Get-Location).Path, ''))
"
}

# 2. PACKAGE.JSON
$summary += "
=== 2. PACKAGE.JSON ===
"
if (Test-Path 'package.json') { $summary += (Get-Content 'package.json' -Raw) }

# 3. PRISMA SCHEMA
$summary += "
=== 3. PRISMA SCHEMA ===
"
if (Test-Path 'prisma/schema.prisma') { $summary += (Get-Content 'prisma/schema.prisma' -Raw) }

# 4. ENV KEYS
$summary += "
=== 4. ENV KEYS FOUND ===
"
if (Test-Path '.env.local') {
    Get-Content '.env.local' | ForEach-Object {
        if ($_ -match '^([A-Z0-9_]+)=') { $summary += "$($Matches[1])
" }
    }
}

# SAVE
$summary | Out-File -FilePath 'NEXFLOW_SUMMARY.txt' -Encoding UTF8
Write-Host '========================================' -ForegroundColor Green
Write-Host '  COMPACT SUMMARY READY: NEXFLOW_SUMMARY.txt' -ForegroundColor Green
Write-Host '  Ab is file ka text asani se paste ho jayega!' -ForegroundColor Yellow
Write-Host '========================================' -ForegroundColor Green
