const expected = '9a5ca38c95b66764736853e4d0c4123484e69217';
const response = await fetch('https://ant.design/index-cn');

if (!response.ok) {
  throw new Error(`Unable to read official baseline: HTTP ${response.status}`);
}

const html = await response.text();
const actual = html.match(/<meta name="build-hash" content="([^"]+)"/)?.[1];

if (actual !== expected) {
  throw new Error(`Official build hash changed: expected ${expected}, received ${actual ?? 'missing'}`);
}

console.log(`Official Ant Design baseline verified: ${actual}`);
