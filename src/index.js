const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');
const io = require('@actions/io');
const md5 = require('md5');
const os = require('os');
const path = require('path');

async function run() {
  try {
    const inputSecretsFile = core.getInput('secrets_file', { required: true });
    const inputMap = core.getInput('map', { required: true });

    // https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#limits-for-secrets
    const secretsPath = path.resolve(os.homedir(), 'secrets');
    const gpgPath = path.resolve(inputSecretsFile);
    const secretsFile = path.resolve(secretsPath, md5(inputSecretsFile + inputMap) + '.json');
    const passphrase = process.env.GPG_PASSPHRASE;

    core.setSecret(passphrase);

    await io.mkdirP(secretsPath);

    await exec.exec('gpg', [
      '--quiet',
      '--batch',
      '--yes',
      '--decrypt',
      '--passphrase=' + passphrase,
      '--output=' + secretsFile,
      gpgPath,
    ]);

    const secrets = JSON.parse(fs.readFileSync(secretsFile));
    const map = inputMap.split(',')
      .reduce(function (object, string) {
        const [key, value] = string.split('=');

        if (key === undefined || value === undefined) {
          core.warning('The mappings input is badly formatted.');
        } else {
          object[key.trim()] = value.trim();
        }

        return object;
      }, {});

    if (Object.keys(map).length === 0) {
      core.warning('The mappings input is empty or badly formatted.');
    }

    for (const [environmentVariableKey, secretKey] of Object.entries(map)) {
      const secret = secrets[secretKey];

      if (secret === undefined) {
        core.warning(`The key "$secretKey" is not in the JSON file.`);
      }

      core.setSecret(secret);
      core.exportVariable(environmentVariableKey, secret);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();