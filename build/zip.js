const exec = require('child_process').execSync;

const isWin = process.platform === 'win32';

if (isWin) {
    exec('powershell Compress-Archive ./dist/* extension.zip -Force', {
        shell: 'powershell.exe'
    });
} else {
    exec(`zip -r ../extension.zip *`, {
        cwd: 'dist/',
        encoding: 'utf-8'
    });
}
