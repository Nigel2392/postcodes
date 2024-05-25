param (
    [string]$CommitMessage = "Update to package",
    [bool]$Tag = $false,
    [string]$TagName = "0.0.0",
    [bool]$PyPi = $false
)

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
