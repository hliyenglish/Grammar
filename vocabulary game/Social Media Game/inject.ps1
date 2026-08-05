$vocabFiles = @("nouns.json", "nouns2.json", "verbs.json", "adjectives.json", "others.json")
$allVocabItems = @()

foreach ($file in $vocabFiles) {
    if (Test-Path $file) {
        $text = [System.IO.File]::ReadAllText((Resolve-Path $file).Path, [System.Text.Encoding]::UTF8)
        $text = $text.Trim()
        if ($text.StartsWith("[")) { $text = $text.Substring(1) }
        if ($text.EndsWith("]")) { $text = $text.Substring(0, $text.Length - 1) }
        $text = $text.Trim()
        if ($text.Length -gt 0) {
            $allVocabItems += $text
        }
    }
}

$vocabStr = "[" + ($allVocabItems -join ",`r`n") + "]"

$phrasesText = [System.IO.File]::ReadAllText((Resolve-Path "phrases.json").Path, [System.Text.Encoding]::UTF8)
$phrasesText = $phrasesText.Trim()

$htmlPath = (Resolve-Path "Social_Media_Game.html").Path
$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)

$idx1 = $html.IndexOf("const allVocab = [")
$idx2 = $html.IndexOf("const phrases = [", $idx1)
$idx3 = $html.IndexOf("let particles =", $idx2)

if ($idx1 -ge 0 -and $idx2 -gt $idx1 -and $idx3 -gt $idx2) {
    $part1 = $html.Substring(0, $idx1)
    $part2 = "const allVocab = $vocabStr;`r`n`r`nconst phrases = $phrasesText;`r`n`r`n"
    $part3 = $html.Substring($idx3)
    
    $finalHtml = $part1 + $part2 + $part3
    
    # Write as UTF8 without BOM using .NET
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($htmlPath, $finalHtml, $utf8NoBom)
    
    Write-Host "Injected successfully!"
} else {
    Write-Host "Failed to find indices. $idx1, $idx2, $idx3"
}
