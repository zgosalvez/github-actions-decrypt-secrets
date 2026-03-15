import * as core from '@actions/core';
import * as io from '@actions/io';
import os from 'os';
import path from 'path';

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
