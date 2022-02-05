const exec = require('child_process').execSync;

exec('powershell Compress-Archive ./dist/* extension.zip -Force', {
    shell: 'powershell.exe'
});

// todo for UNIX-systems
// exec(`zip -r extension.zip *`, {
//     cwd: 'dist/',
//     encoding: 'utf-8'
// });
