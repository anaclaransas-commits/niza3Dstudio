$file = 'c:\Users\Isaac\Desktop\3dprint app\3dprint-master-manager\src\components\Products.tsx'
$content = Get-Content $file -Raw

# Find the specific pattern and fix it
# Match from className to the /> with all the blank lines in between
$pattern = '(className="w-full h-full object-cover")\r\n(                    \r\n){3,}(\r\n                    />)'
$replacement = '$1$3'
$content = $content -replace $pattern, $replacement

Set-Content $file -NoNewline -Value $content
Write-Host "Fixed first img tag"
