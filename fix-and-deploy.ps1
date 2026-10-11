Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  NEXFLOW CRM - 1-CLICK FIX & DEPLOY SCRIPT       " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Fix vercel.json (Hobby Plan Cron Limit)
Write-Host "`n[1/5] Updating vercel.json for Hobby Cron..." -ForegroundColor Yellow
$vercelJson = @'
{
  "crons": [
    {
      "path": "/api/cron/followups",
      "schedule": "0 9 * * *"
    }
  ]
}
