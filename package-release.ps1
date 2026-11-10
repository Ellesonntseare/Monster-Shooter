param()
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$releaseRoot = (Get-Location).Path
$releaseArchive = 'C:\Users\elles\Documents\ChatGPT\New project\RIFTWATCH-complete.zip'
if(Test-Path -LiteralPath $releaseArchive){throw 'Output already exists; refusing to replace it.'}
$releaseFolders = @('public','models','vendor','node_modules','tests')
$releaseFiles = @()
foreach($folder in $releaseFolders){$releaseFiles += Get-ChildItem -LiteralPath (Join-Path $releaseRoot $folder) -File -Recurse}
$releaseFiles += Get-ChildItem -LiteralPath $releaseRoot -File | Where-Object { $_.Extension -eq '.md' -or $_.Name -in @('README.txt','server.js','multiplayer-server.cjs','package.json','package-lock.json','START-GAME.cmd') }
$releaseZip = [System.IO.Compression.ZipFile]::Open($releaseArchive,[System.IO.Compression.ZipArchiveMode]::Create)
try{
  $releaseCount=0
  foreach($file in $releaseFiles){
    $relative=$file.FullName.Substring($releaseRoot.Length+1).Replace('\','/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($releaseZip,$file.FullName,'RIFTWATCH/'+$relative,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    $releaseCount++
    if($releaseCount % 400 -eq 0){Write-Output "Packed $releaseCount / $($releaseFiles.Count) files"}
  }
}finally{$releaseZip.Dispose()}
Write-Output "Archive created: $releaseArchive"
Write-Output "Expected files: $($releaseFiles.Count)"
