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
    quickgo -v exec version v=$TagName
    quickgo -v exec git tag=$gitTagName m=$CommitMessage
} else {
    quickgo -v exec git m=$CommitMessage
}

if ($PyPi) {
    py setup.py sdist
    py -m twine upload "dist/django_postcodes-${TagName}.tar.gz"
}
