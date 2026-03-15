const fs = require('fs');
const path = require('path');

function findEnv(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                findEnv(fullPath);
            }
        } else if (file.startsWith('.env')) {
            console.log(fullPath);
        }
    }
}

findEnv('C:\\Users\\DELL\\OneDrive\\Desktop\\Know-your-animal-app-main');
