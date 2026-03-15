const core = require('@actions/core');
const io = require('@actions/io');
const os = require('os');
const path = require('path');

function getSecretsFilePath() {
  const actionName = process.env.GITHUB_ACTION || 'github-actions-decrypt-secrets';
  const secretsPath = path.resolve(os.tmpdir(), actionName);

  return path.resolve(secretsPath, 'secrets.json');
}

async function run() {
  try {
    const secretsFile = getSecretsFilePath();
    await io.rmRF(secretsFile);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
