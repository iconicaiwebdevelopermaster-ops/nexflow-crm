$report = "=== NEXFLOW CRM FULL PROJECT AUDIT ===
"
$report += "Date: $(Get-Date)

"

# 1. FOLDER TREE
$report += "=== 1. COMPLETE FOLDER STRUCTURE ===
"
$report += (Get-ChildItem -Recurse -Exclude node_modules,.next,.git | Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.git' } | Select-Object FullName, Length | Format-Table -AutoSize | Out-String)

# 2. PACKAGE.JSON
$report += "
=== 2. PACKAGE.JSON ===
"
if (Test-Path 'package.json') { $report += (Get-Content 'package.json' -Raw) }

# 3. PRISMA SCHEMA
$report += "
=== 3. PRISMA SCHEMA ===
"
if (Test-Path 'prisma/schema.prisma') { $report += (Get-Content 'prisma/schema.prisma' -Raw) }

# 4. ENV FILE (keys only, no secrets)
$report += "
=== 4. ENV VARIABLES (KEYS ONLY) ===
"
if (Test-Path '.env.local') {
    Get-Content '.env.local' | ForEach-Object {
        if ($_ -match '^([A-Z_]+)=') { $report += "$($Matches[1])=***HIDDEN***
" }
    }
}

# 5. NEXT CONFIG
$report += "
=== 5. NEXT.CONFIG ===
"
if (Test-Path 'next.config.js') { $report += (Get-Content 'next.config.js' -Raw) }
if (Test-Path 'next.config.mjs') { $report += (Get-Content 'next.config.mjs' -Raw) }

# 6. TAILWIND CONFIG
$report += "
=== 6. TAILWIND CONFIG ===
"
if (Test-Path 'tailwind.config.ts') { $report += (Get-Content 'tailwind.config.ts' -Raw) }
if (Test-Path 'tailwind.config.js') { $report += (Get-Content 'tailwind.config.js' -Raw) }

# 7. TSCONFIG
$report += "
=== 7. TSCONFIG ===
"
if (Test-Path 'tsconfig.json') { $report += (Get-Content 'tsconfig.json' -Raw) }

# 8. ALL PAGE FILES
$report += "
=== 8. ALL PAGE/ROUTE FILES ===
"
Get-ChildItem -Path 'src/app' -Recurse -Filter 'page.tsx' -ErrorAction SilentlyContinue | ForEach-Object {
    $report += "
--- $($_.FullName) ---
"
    $report += (Get-Content $_.FullName -Raw)
}

# 9. ALL API ROUTES
$report += "
=== 9. ALL API ROUTES ===
"
Get-ChildItem -Path 'src/app/api' -Recurse -Filter 'route.ts' -ErrorAction SilentlyContinue | ForEach-Object {
    $report += "
--- $($_.FullName) ---
"
    $report += (Get-Content $_.FullName -Raw)
}

# 10. ALL LIB FILES
$report += "
=== 10. ALL LIB FILES ===
"
Get-ChildItem -Path 'src/lib' -Recurse -Include '*.ts','*.tsx' -ErrorAction SilentlyContinue | ForEach-Object {
    $report += "
--- $($_.FullName) ---
"
    $report += (Get-Content $_.FullName -Raw)
}

# 11. ALL COMPONENTS
$report += "
=== 11. ALL COMPONENTS ===
"
Get-ChildItem -Path 'src/components' -Recurse -Include '*.ts','*.tsx' -ErrorAction SilentlyContinue | ForEach-Object {
    $report += "
--- $($_.FullName) ---
"
    $report += (Get-Content $_.FullName -Raw)
}

# 12. MIDDLEWARE
$report += "
=== 12. MIDDLEWARE ===
"
if (Test-Path 'src/middleware.ts') { $report += (Get-Content 'src/middleware.ts' -Raw) }
if (Test-Path 'middleware.ts') { $report += (Get-Content 'middleware.ts' -Raw) }

# 13. AUTH CONFIG
$report += "
=== 13. AUTH CONFIG ===
"
Get-ChildItem -Path 'src' -Recurse -Filter 'auth*' -Include '*.ts','*.tsx' -ErrorAction SilentlyContinue | ForEach-Object {
    $report += "
--- $($_.FullName) ---
"
    $report += (Get-Content $_.FullName -Raw)
}

# 14. LAYOUT FILES
$report += "
=== 14. LAYOUT FILES ===
"
Get-ChildItem -Path 'src/app' -Recurse -Filter 'layout.tsx' -ErrorAction SilentlyContinue | ForEach-Object {
    $report += "
--- $($_.FullName) ---
"
    $report += (Get-Content $_.FullName -Raw)
}

# SAVE REPORT
$report | Out-File -FilePath 'NEXFLOW_AUDIT_REPORT.txt' -Encoding UTF8
Write-Host '========================================' -ForegroundColor Green
Write-Host '  AUDIT COMPLETE!' -ForegroundColor Green
Write-Host '  File: NEXFLOW_AUDIT_REPORT.txt' -ForegroundColor Green
Write-Host '  Size:' ((Get-Item 'NEXFLOW_AUDIT_REPORT.txt').Length / 1KB).ToString('F1') 'KB' -ForegroundColor Yellow
Write-Host '========================================' -ForegroundColor Green
