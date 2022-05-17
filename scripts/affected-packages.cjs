const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const child = child_process.spawnSync('git', ['diff', '--name-status', 'origin/develop'], {
    encoding: 'utf8',
});

if (child.error) {
    console.log('ERROR: ', child.error);
}

const directlyChangedPackages = child.stdout
    .trim()
    .replace(/M	/g, '')
    .split('\n')
    .map(path => path.split('/'))
    // only paths starting with 'packages'
    .filter(path => path[0] === 'packages')
    // pick package name
    .map(path => path[1])
    // only unique values
    .filter((path, index, self) => self.indexOf(path) === index);

const candidatePackages = [...directlyChangedPackages];

const readPkgJson = path => {
    return JSON.parse(
        fs.readFileSync(`${path}/package.json`, {
            encoding: 'utf-8',
        }),
    );
};

const deps = {};

const rootPkgJson = readPkgJson(path.join(ROOT));

const affectedPackages = [];

while (candidatePackages.length) {
    for (let i = 0; i < candidatePackages.length; i++) {
        const pkgJSON = readPkgJson(`packages/${candidatePackages[i]}`);
        const deps = { ...(pkgJSON.dependencies || {}), ...(pkgJSON.devDependencies || {}) };
        Object.keys(deps).forEach(dep => {
            const parts = dep.split('/');
            if (parts[0] === '@trezor') {
                if (!affectedPackages.includes(parts[1])) {
                    affectedPackages.push(parts[1]);
                }

                if (!candidatePackages.includes(parts[1])) {
                    candidatePackages.push(parts[1]);
                }
            }
        });
    }
    candidatePackages.splice(0, 1);
}

const allPackages = [...affectedPackages, ...directlyChangedPackages].filter(
    (path, index, self) => self.indexOf(path) === index,
);

console.log('allPackages', allPackages);

process.stdout.write('true');
