[Console]::WriteLine("Starting...")

# Check if node processes are running
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    [Console]::WriteLine("Stopped existing node processes")
}

# Start npm run dev
$npxJsonServer = Start-Process -FilePath "npx" -ArgumentList "json-server server/data.json --port 4000" -Wait -PassThru
$npmDev = Start-Process -FilePath "npm" -ArgumentList "run dev" -Wait -PassThru

# Cleanup
if ($npxJsonServer) { Stop-Process -Id $npxJsonServer.Id -Force }
if ($npmDev) { Stop-Process -Id $npmDev.Id -Force }