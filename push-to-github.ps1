param (
    [string]$CommitMessage = "Update to package",
    [bool]$Tag = $false,
    [string]$TagName = "0.0.0",
    [bool]$PyPi = $false
)

if ($TagName[0] -eq "v") {
    Write-Host "Tag name should not start with 'v'"
    exit
}

if ($TagName -ne "0.0.0") {
    $Tag = $true
}

$gitTagName = "v$TagName"

if ($Tag) {
    quickgo exec version v=$TagName
    quickgo exec git tag=$gitTagName m=$CommitMessage
} else {
    quickgo exec git m=$CommitMessage
}

if ($PyPi) {
    python setup.py sdist
    twine upload "dist/django_postcodes-${TagName}.tar.gz"
}
