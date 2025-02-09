# GitHub Action — Decrypt Secrets

This GitHub Action (written in JavaScript) allows you to leverage GitHub Actions to decrypt secrets from a JSON file using `gpg`. For more information, see the "[gpg manpage](https://www.gnupg.org/gph/de/manual/r1023.html)." Common workflows are:

* [A central secrets repository](#a-central-secrets-repository)
* [Environment based secrets](#environment-based-secrets)

*Note:* This currently does not support a JSON file that is more than one level deep.

## Usage
### Pre-requisites
Create a workflow `.yml` file in your `.github/workflows` directory. [Example workflows](#common-workflows) are available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs
All of these inputs are required. For more information on these inputs, see the [Workflow syntax for GitHub Actions](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstepswith)

- `secrets_file`: The `gpg` file. For example, `.github/workflows/secrets.json.gpg`
- `map`: Describes the map between the environment variables and secret keys. For example, `SECRET_PASSWORD=PASSWORD,PASSPHRASE=passphrase`

Additionally, you must set the `GPG_PASSPHRASE` environment variable to decrypt the JSON file.

### Outputs
None. The secrets are exported as environment variables through the `map` input. For more information, see the [Environment variables](https://docs.github.com/actions/reference/environment-variables) documentation

### Common workflows

On any workflow you will need to do the following:

1. Store your secrets in a JSON file. *Warning:* Do not commit this in your repository.
2. Encrypt your JSON file to `gpg` using a long alphanumeric passphrase. For example:
```shell
gpg --symmetric --cipher-algo AES256 secrets.json 
```
3. Place and commit the generated `gpg` file (e.g., `secrets.json.gpg`) in your repository. The recommended location is `.github/workflows/secrets.json.gpg` or `.github/workflows/secrets/beta.json.gpg`.

#### A central secrets repository
Instead of manually setting all of your secrets in GitHub's settings, you can simply store the passphrase you used when encrypting the JSON file using `gpg`. For example:
```json
{
    "PASSWORD": "cSHS4mE&vDRJqKaPO&Fi{g@JCyv3|#Y><>Mp{8KP2m<#H0DL*F",
    "passphrase": "7heGrecgc<7oYLURMR%y6y#)fEl2zWF%j%PiL$E5s$za4PtxlC",
}
```
```yaml
on: push

name: Continuous Integration

jobs:
  build:
    name: Example
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Decrypt secrets
        uses: zgosalvez/github-actions-decrypt-secrets@v3
        with:
            secrets_file: .github/workflows/secrets.json.gpg
            map: 'SECRET_PASSWORD=PASSWORD,PASSPHRASE=passphrase'
        env:
            GPG_PASSPHRASE: ${{ secrets.SECRETS_PASSPHRASE }}
      - name: Test (Do not expose your actual secrets!)
        run: |
          echo $SECRET_PASSWORD
          echo $PASSPHRASE
```

#### Environment-based secrets
Another common scenario is when you need the same environment variable with a different value that depends on the environment. For example, you may have two JSON files: beta and production.
```yaml
on:
  push:
    - beta
    - production

name: Continuous Deployment

jobs:
  build:
    name: Example
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Determine environment
        id: determine_environment
        run: echo "::set-output name=environment::${GITHUB_REF#refs/heads/}"
      - name: Decrypt ${{ steps.determine_environment.outputs.environment }} secrets
        uses: zgosalvez/github-actions-decrypt-secrets@v3
        with:
            secrets_file: .github/workflows/secrets/${{ steps.determine_environment.outputs.environment }}.json.gpg
            map: 'SECRET_PASSWORD=PASSWORD,PASSPHRASE=passphrase'
        env:
            GPG_PASSPHRASE: ${{ secrets.SECRETS_PASSPHRASE }}
      - name: Test (Do not expose your actual secrets!)
        run: |
          echo $SECRET_PASSWORD
          echo $PASSPHRASE
```

## License
The scripts and documentation in this project are released under the [MIT License](LICENSE.md)
