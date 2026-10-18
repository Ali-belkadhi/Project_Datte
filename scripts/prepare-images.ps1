#requires -Version 5
# Prepares DEGLA placeholder images from the generated brand photos.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/prepare-images.ps1 -Src <dir with generated jpgs>
param([Parameter(Mandatory = $true)][string]$Src)

Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "public\images"
New-Item -ItemType Directory -Force -Path "$out\products", "$out\categories", "$out\scenes", "$out\textures" | Out-Null

function Find([string]$prefix) { (Get-ChildItem $Src -Filter "$prefix*.jpg" | Select-Object -First 1).FullName }

function Save-Jpeg([System.Drawing.Bitmap]$bmp, [string]$path, [int]$quality = 88) {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$quality)
  $bmp.Save($path, $codec, $params)
}

function Crop([string]$file, [int]$x, [int]$y, [int]$w, [int]$h, [string]$dest, [int]$rotate = 0, [int]$pad = 0) {
  $img = [System.Drawing.Image]::FromFile($file)
  $cw = $w + 2 * $pad; $ch = $h + 2 * $pad
  $bmp = New-Object System.Drawing.Bitmap $cw, $ch
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear([System.Drawing.Color]::FromArgb(255, 22, 58, 41))
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle $pad, $pad, $w, $h), (New-Object System.Drawing.Rectangle $x, $y, $w, $h), [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $img.Dispose()
  if ($rotate -eq 270) { $bmp.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
  if ($rotate -eq 90) { $bmp.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
  Save-Jpeg $bmp $dest
  $bmp.Dispose()
}

$hero = Find "hero_desert_bg"
$open = Find "coffret_prestige_open"
$lid = Find "coffret_lid_texture"

Copy-Item $hero "$out\scenes\hero-desert.jpg" -Force
Copy-Item $open "$out\products\coffret-prestige-open.jpg" -Force
# Lid artwork without the white margin (used as 3D box texture + gallery image)
Crop $lid 112 52 1044 736 "$out\textures\coffret-lid.jpg"
Copy-Item "$out\textures\coffret-lid.jpg" "$out\products\coffret-prestige-lid.jpg" -Force
# Green inner lid with gold palm (used for box sides / logo motif)
Crop $open 60 10 1080 250 "$out\textures\coffret-inner-lid.jpg"

# Products & categories cut from the open coffret photo (1200x896)
Crop $open 100 345 492 140 "$out\products\sirop-dattes.jpg" 270 40
Crop $open 160 552 192 252 "$out\products\dattes-deglet-nour.jpg" 0 30
Crop $open 380 552 172 252 "$out\products\confiture-dattes.jpg" 0 30
Crop $open 632 312 140 156 "$out\products\pate-dattes.jpg" 0 24
Crop $open 956 312 140 156 "$out\products\sucre-dattes.jpg" 0 24
Crop $open 728 490 272 146 "$out\products\cafe-dattes.jpg" 0 30
Crop $open 636 656 462 152 "$out\products\dattes-fourrees.jpg" 0 30
Crop $open 1004 672 86 112 "$out\products\boules-dattes.jpg" 0 20
Crop $open 632 300 470 175 "$out\products\coffret-decouverte.jpg" 0 30

# Label-only crops, wrapped around the procedural 3D bottle / jars
Crop $open 150 352 236 124 "$out\textures\label-sirop.jpg" 270
Crop $open 168 634 178 136 "$out\textures\label-deglet.jpg"
Crop $open 640 368 124 74 "$out\textures\label-pate.jpg"
Crop $open 384 634 160 136 "$out\textures\label-confiture.jpg"
Crop $open 962 368 124 74 "$out\textures\label-sucre.jpg"

Copy-Item "$out\products\dattes-deglet-nour.jpg" "$out\categories\dattes-naturelles.jpg" -Force
Copy-Item "$out\products\dattes-fourrees.jpg" "$out\categories\dattes-fourrees.jpg" -Force
Copy-Item "$out\products\sirop-dattes.jpg" "$out\categories\sirops.jpg" -Force
Copy-Item "$out\products\pate-dattes.jpg" "$out\categories\pates-sucre.jpg" -Force
Copy-Item "$out\products\cafe-dattes.jpg" "$out\categories\cafe.jpg" -Force
Copy-Item "$out\products\boules-dattes.jpg" "$out\categories\biscuits-boules.jpg" -Force

Write-Host "Images written to $out"
