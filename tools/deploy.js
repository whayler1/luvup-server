import path from 'path';
import fetch from 'node-fetch';
import { spawn } from './lib/cp';
import { makeDir, moveDir, cleanDir } from './lib/fs';
import run from './run';

const options = {
  cwd: path.resolve(__dirname, '../build'),
  stdio: ['ignore', 'inherit', 'inherit'],
};

/**
 * Deploy the contents of the `/build` folder to elastic beanstalk.
 */
async function deploy() {
  // Initialize a new repository
  await makeDir('build');

  // Build the project in RELEASE mode which
  // generates optimized and minimized bundles
  // process.argv.push('--release');
  // if (remote.static) process.argv.push('--static');
  await run(require('./build').default); // eslint-disable-line global-require
  if (process.argv.includes('--static')) {
    await cleanDir('build/*', {
      nosort: true,
      dot: true,
      ignore: ['build/.git', 'build/public'],
    });
    await moveDir('build/public', 'build');
  }

  // Zip the contents of the build folder
  await spawn('zip', ['-9', '-r', 'build.zip', '.'], options);

  // Deploy the zip to eb
  await spawn('eb', ['deploy', '--staged'], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
}

export default deploy;
