const fs = require('fs');
const mainPath = 'public/js/main.js';
let s = fs.readFileSync(mainPath, 'utf8');
function replace(a,b) { if (!s.includes(a)) throw Error('Missing anchor: '+a.slice(0,100)); s=s.replace(a,b); }
replace("import * as THREE from 'three';", "import * as THREE from 'three';\nimport { createOperations } from './operations.js';");
replace('Math.min(devicePixelRatio, 2)', 'Math.min(devicePixelRatio, 1.5)');
replace('function spawnMonster(type, x, z) {', `function spawnMonster(type, x, z) {`);
replace('state.kills++; sfx.kill();', 'state.kills++; sfx.kill(); operations.drop(new THREE.Vector3(m.x, m.y || 0, m.z));');
replace('if (o === m || o.dead) continue;', 'if (o === m || o.dead || T.stationary) continue;');
replace('const ns = Math.min(4, 1 + Math.floor(n / 2)); spawnSentries(ns);', 'operations.start(n);\n  const ns = Math.min(3, 1 + Math.floor(n / 3)); spawnSentries(ns);');
const begin = s.indexOf('function spawnWaveMonster(forced) {'), end = s.indexOf('function updateWaves(dt)', begin);
s=s.slice(0,begin)+`function spawnWaveMonster(forced) {
  const type = forced || pickType(), T = MONSTER_TYPES[type];
  if (T.stationary) {
    const spot = defenderSpot(T.radius);
    if (!spot) return false;
    spawnMonster(type, spot.x, spot.z); return true;
  }
  if (state.map.ring) { const p = ringSpot(); if (p) { spawnMonster(type, p[0], p[1]); return true; } }
  const far = state.map.spawns.filter(([x,z]) => Math.hypot(x-P.pos.x,z-P.pos.z)>15 && !fieldBlocked(x,z,1));
  if (!far.length) return false;
  const [x,z] = far[Math.floor(Math.random()*far.length)]; spawnMonster(type,x,z); return true;
}
`+s.slice(end);
replace("state.bossQueued = false; spawnWaveMonster('boss'); banner('BOSS: MINOTAUR WARLORD'); sfx.growl(1);", "if (spawnWaveMonster('boss')) { state.bossQueued = false; banner('BOSS: MINOTAUR WARLORD'); sfx.growl(1); } else state.bossT = 1;");
replace('spawnWaveMonster(); state.toSpawn--;', 'if (spawnWaveMonster()) state.toSpawn--;');
replace('aliveCount() === 0 && !state.bossQueued)', 'aliveCount() === 0 && !state.bossQueued && operations.ready)');
replace('P.hp -= a;', 'P.hp -= a * (operations.buffs.shield > 0 ? 0.35 : 1);');
replace('const speed = keys.ShiftLeft && fwd > 0 ? CFG.sprint : CFG.walk;', 'const speed = (keys.ShiftLeft && fwd > 0 ? CFG.sprint : CFG.walk) * (operations.buffs.speed > 0 ? 1.35 : 1);');
replace('damageMonster(mm, CFG.gun.dmg *', 'damageMonster(mm, (operations.buffs.damage > 0 ? 1.8 : 1) * CFG.gun.dmg *');
replace('updateWaves(dt); updateMonsters(dt);', 'operations.update(dt); updateWaves(dt); updateMonsters(dt);');
replace("if (e.code === 'KeyR') startReload();", "if (e.code === 'KeyE') operations.input(true);\n  if (e.code === 'KeyR') startReload();");
replace("addEventListener('keyup', e => { keys[e.code] = false; });", "addEventListener('keyup', e => { keys[e.code] = false; if (e.code === 'KeyE') operations.input(false); });");
replace('function showPause() { state.paused', 'function showPause() { operations.input(false); for (const k in keys) keys[k] = false; state.paused');
replace("addEventListener('blur', () => { for", "addEventListener('blur', () => { operations.input(false); for");
replace("$('loadtxt').textContent = 'Pick a map';", "$('loadtxt').textContent = 'SYSTEM READY / SELECT YOUR DEPLOYMENT';");
s=s.replaceAll("'Pick a map'", "'SYSTEM READY / SELECT YOUR DEPLOYMENT'");
replace("const b = document.createElement('button'); b.className = 'mapbtn';", "const b = document.createElement('button'); b.className = 'mapbtn map-' + key;");
replace('b.innerHTML = `${m.name}<small>${m.desc}</small>`;', 'b.innerHTML = `<span class="map-index">${String(Object.keys(MAPS).indexOf(key)+1).padStart(2,"0")} / ${m.open ? "OPEN WORLD" : "COMBAT ZONE"}</span><span class="map-art"></span><b>${m.name}</b><small>${m.desc}</small><span class="deploy">DEPLOY ↗</span>`;');
replace('for (const [key, m] of Object.entries(MAPS))', 'for (const [key, m] of Object.entries(MAPS).sort(([a],[b]) => (a === "outpost" ? -1 : b === "outpost" ? 1 : 0)))');
replace('c.save(); c.translate(h, h);', `for (const item of operations.items) { c.fillStyle = item.kind === 'relay' ? '#80fff0' : '#8bb9c6'; const x = clamp(h+(item.pos.x-P.pos.x)*MSC,5,MINI-5), y=clamp(h+(item.pos.z-P.pos.z)*MSC,5,MINI-5); c.fillRect(x-2,y-2,4,4); }
  c.save(); c.translate(h, h);`);
replace("$('left').textContent = `${aliveCount() + state.toSpawn} LEFT`;", "$('left').textContent = `${aliveCount() + state.toSpawn + (state.bossQueued ? 1 : 0)} HOSTILES`;\n  $('compass').textContent = ['N','NE','E','SE','S','SW','W','NW'][Math.round((( -P.yaw * 180 / Math.PI) % 360 + 360) % 360 / 45) % 8] + ' / ' + state.map.name.toUpperCase();");
const startS = s.indexOf('function spawnSentries(n) {'), endS = s.indexOf('function startWave(n)',startS);
s=s.slice(0,startS)+`function spawnSentries(n) {
  for (let i=0;i<n;i++) { const p=defenderSpot(0.6); if(p) spawnMonster('sentry',p.x,p.z); }
}
`+s.slice(endS);
const hooks = `
function fieldBlocked(x,z,r=1) {
  return state.colliders.some(c => x>c.minX-r && x<c.maxX+r && z>c.minZ-r && z<c.maxZ+r) || state.barrels.some(b=>b.alive && Math.hypot(x-b.x,z-b.z)<r+0.6);
}
function fieldPath(a,b) {
  const distance=a.distanceTo(b), dir=b.clone().sub(a).normalize();
  if (state.collMesh) {
    for (let d=0;d<=distance;d+=0.8) { const p=a.clone().addScaledVector(dir,d); const y=floorAt(p.x,p.z,p.y+0.5,1.2); if(y===null || Math.abs(y-p.y)>0.45) return false; }
    return !castRay(a.clone().add(new THREE.Vector3(0,0.8,0)),dir,distance);
  }
  for(let d=0;d<=distance;d+=0.5) { const p=a.clone().addScaledVector(dir,d); if(fieldBlocked(p.x,p.z,0.5)) return false; } return true;
}
function defenderSpot(radius) {
  const max=Math.min(38,Math.max(...state.map.size)*0.75);
  for(let i=0;i<160;i++) {
    const a=rand(0,Math.PI*2),r=rand(18,max),x=P.pos.x+Math.cos(a)*r,z=P.pos.z+Math.sin(a)*r;
    if(Math.abs(x)>state.map.size[0]/2-2 || Math.abs(z)>state.map.size[1]/2-2 || fieldBlocked(x,z,radius+0.8)) continue;
    const y=state.collMesh?floorAt(x,z,P.pos.y+0.6,2):0;
    if(y===null || Math.abs(y-P.pos.y)>0.8 || state.monsters.some(m=>!m.dead&&Math.hypot(m.x-x,m.z-z)<3)) continue;
    const p=new THREE.Vector3(x,y,z), origin=p.clone().add(new THREE.Vector3(0,1.5,0)), target=P.pos.clone().add(new THREE.Vector3(0,1.2,0)), direction=target.sub(origin), distance=direction.length();
    const losRay=new THREE.Raycaster(origin,direction.normalize(),0,distance); losRay.firstHitOnly=true;
    if(losRay.intersectObjects(state.wallMeshes,true).length) continue;
    return p;
  } return null;
}
const operations=createOperations({ state,P,camera,floorAt,clearPath:fieldPath,blocked:fieldBlocked,banner,
  reward:n=>{state.score+=n;state.credits+=n;},refill:giveAmmo,sound:()=>sfx.pickup() });
`;
replace('// menu\n',hooks+'\n// menu\n');
fs.writeFileSync(mainPath,s);
let m=fs.readFileSync('public/js/monsters.js','utf8');
for(const type of ['sniper','demon','brute','boss']) {
  const re=new RegExp('('+type+':\\s*\\{[^\\n]*?)speed: [\\d.]+'); m=m.replace(re,'$1stationary: true, speed: 0');
}
m=m.replace('cap: 6, shoot:', 'cap: 2, shoot:');
fs.writeFileSync('public/js/monsters.js',m);
let h=fs.readFileSync('public/index.html','utf8');
h=h.replaceAll('Monster Shooter','RIFTWATCH').replace('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js','/vendor/three/build/three.module.js').replace('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/','/vendor/three/examples/jsm/').replace('https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.8.3/build/index.module.js','/vendor/three-mesh-bvh/build/index.module.js');
h=h.replace('<h1>MONSTER SHOOTER</h1>',`<div class="menu-brand"><span class="eyebrow">HERO DIVISION / FIELD OPERATIONS</span><h1>RIFT<span>WATCH</span><i>01</i></h1><p class="intro">The world broke open.<br><strong>Go take it back.</strong></p><p class="brief">Recover the data. Hold the sector. Make it out alive.</p></div>`);
h=h.replace('<div id="modes">','<div class="deployment-label">CHOOSE YOUR OPERATION <span>06 LOCATIONS / SOLO PVE</span></div><div id="modes">');
h=h.replace('10 levels','10 sectors + extraction').replace('until you die','unlimited deployments');
h=h.replace('Headshots do 4x damage and +50 points','E hold to recover / extract · E open mystery cache · Gold radar = stationary defenders');
h=h.replace('<div id="cross"></div>',`<div id="compass"></div><div id="objective"><span class="eyebrow">ACTIVE OPERATION</span><h3 id="objective-title">RECOVER THE DATA</h3><p id="objective-detail"></p><div class="objective-track"><div id="objective-progress"></div></div></div><div id="interact"></div><div id="buffs"></div><div id="waypoint"></div><div id="cross"></div>`);
h=h.replace('<p>Click to resume</p>','<p>Click to resume your operation</p><p class="keys">WASD move · Mouse aim · E interact · R reload · G / F explosives</p>');
fs.writeFileSync('public/index.html',h);
