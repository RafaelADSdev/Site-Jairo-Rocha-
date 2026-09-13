$ErrorActionPreference = 'Stop'
$photoTargets = @(
    @{Stem='porto-real'; Page='https://commons.wikimedia.org/wiki/File:BRUNO_LIMA_PISCINAS_NATURAIS_DE_PORTO_DE_GALINHAS_IPOJUCA_PE_(27037766848).jpg'},
    @{Stem='muro-real'; Page='https://commons.wikimedia.org/wiki/File:BRUNO_LIMA_PRAIA_DE_MURO_ALTO_IPOJUCA_PE_(40908731001).jpg'},
    @{Stem='carneiros-real'; Page='https://commons.wikimedia.org/wiki/File:Praia_dos_Carneiros,_Pernambuco.jpg'},
    @{Stem='tamandare-real'; Page='https://commons.wikimedia.org/wiki/File:Praia_de_Tamandar%C3%A9_-_PE_(6866402194).jpg'}
)
$photoDirectory = Join-Path $PSScriptRoot '../assets/litoral/photos'
New-Item -ItemType Directory -Force -Path $photoDirectory | Out-Null
foreach ($photo in $photoTargets) {
    $destination = Join-Path $photoDirectory ($photo.Stem + '.jpg')
    if (Test-Path -LiteralPath $destination) { continue }
    $page = Invoke-WebRequest -Uri $photo.Page
    $original = $page.Links | Where-Object { $_.href -match '^https://upload.wikimedia.org/' -and $_.outerHTML -match 'Original file' } | Select-Object -First 1
    if (!$original) { throw "No verified original image link: $($photo.Page)" }
    $downloadUrl = ($original.href -split '\?')[0]
    Invoke-WebRequest -Uri $downloadUrl -OutFile $destination -UserAgent 'JairoCoastPreview/1.0 (local site development; Wikimedia attribution preserved)'
    Write-Output "$($photo.Stem): $downloadUrl"
}
