// 防止已移除的演示模块再次混入前台或构建。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
for (const file of ['app/admin/page.tsx', 'components/retention-strip.tsx', 'lib/upload-file.ts', 'public/file.svg', 'public/globe.svg', 'public/next.svg', 'public/vercel.svg', 'public/window.svg']) {
  assert(!fs.existsSync(path.join(root, file)), `旧文件不应恢复: ${file}`);
}
const games = fs.readFileSync(path.join(root, 'app/games/page.tsx'), 'utf8');
const catalog = games.slice(games.indexOf('const catalog:'), games.indexOf('const rules:'));
assert.equal((catalog.match(/\bid\s*:/g) || []).length - 1, 12, '保留十二款游戏');
assert(!games.includes('RetentionStrip'));
assert(!games.includes('<QuestCard'));
assert(!games.includes('href="/admin"'));
const mini = fs.readFileSync(path.join(root, 'components/mini-games.tsx'), 'utf8');
assert(!mini.includes("kind==='sequence'"), '删除旧顺序点灯分支');
assert(games.includes('p.get("play")==="sequence"'), '保留旧分享链接向双星归位的兼容跳转');
const relax = fs.readFileSync(path.join(root, 'app/break/page.tsx'), 'utf8');
assert(relax.includes('VentStation'), '烦恼回收站仍存在');
assert(fs.readFileSync(path.join(root,'components/vent-station.tsx'),'utf8').includes('useInferenceRun'), '主动选择在线整理时仍走现有推理入口');
assert(fs.existsSync(path.join(root, 'lib/inference.ts')));
assert(fs.existsSync(path.join(root, 'drizzle/0000_init.sql')), '部署迁移历史应保留');
console.log('PASS: deprecated modules absent; 12 games and legacy-link compatibility preserved; inference and migration infrastructure retained');
