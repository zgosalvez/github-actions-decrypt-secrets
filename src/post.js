const core = require('@actions/core');
const io = require('@actions/io');
const md5 = require('md5');
const os = require('os');
const path = require('path');

async function run() {
  const inputSecretsFile = core.getInput('secrets_file', { required: true });
  const inputMap = core.getInput('map', { required: true });

  try {
    const secretsPath = path.resolve(os.homedir(), 'secrets');
    const secretsFile = path.resolve(secretsPath, md5(inputSecretsFile + inputMap) + '.json');
    await io.rmRF(secretsFile);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();