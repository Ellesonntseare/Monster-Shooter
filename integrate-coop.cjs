const fs=require('fs');let s=fs.readFileSync('public/js/main.js','utf8');
function r(a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,70));s=s.replace(a,b);}
r("import { selectedHero } from './roster.js';","import { selectedHero } from './roster.js';\nimport { createNetwork } from './network.js';");
r('function spawnMonster(type, x, z) {','function spawnMonster(type, x, z) {');
r('type, T, hp: T.hp','id: ++state.nextMonsterId, type, T, hp: T.hp');
r('state.world.add(built.group); state.monsters.push(m);','state.world.add(built.group); state.monsters.push(m);return m;');
r('function damageMonster(m, dmg, point, gib = false, head = false) {\n  if (m.dead) return;',`function damageMonster(m, dmg, point, gib = false, head = false) {
  if (m.dead) return;
  if(network.role==='guest'){network.action({kind:'hit',id:m.id,damage:dmg,pos:point.toArray(),head,gib});m.flash=.1;return;}`);
r('function damageBarrel(b, dmg, point) {',`function damageBarrel(b, dmg, point) {
  if(network.role==='guest'){network.action({kind:'barrel',id:b.netId,damage:dmg,pos:point.toArray()});return;}`);
r('state.collMesh = null; state.extraCollMesh = null;','state.collMesh = null; state.extraCollMesh = null; state.nextMonsterId=0;');
// Each monster pursues the nearest living member of the party.
const a=s.indexOf('function updateMonsters(dt) {'),b=s.indexOf('// ------------------------------------------------------------------ ranged enemies',a);
let ai=s.slice(a,b).replaceAll('P.','player.');
ai=ai.replace('const m = state.monsters[i], T = m.T;',`const m = state.monsters[i], T = m.T;
    const player=closestPlayer(m);m.target=player;`);
ai=ai.replace('hurtPlayer(T.dmg)','hurtTarget(player,T.dmg)');
s=s.slice(0,a)+ai+s.slice(b);
r('function hasLOS(m, dist) {','function hasLOS(m, dist) {\n  const player=m.target || closestPlayer(m);');
let c=s.indexOf('function hasLOS('),d=s.indexOf('const projMats',c);s=s.slice(0,c)+s.slice(c,d).replaceAll('P.','player.')+s.slice(d);
r('const T = m.T, n = S.count || 1, col = T.proj ? 0x88e5ff : 0xffd49a;','const T = m.T, player=m.target || closestPlayer(m), n = S.count || 1, col = T.proj ? 0x88e5ff : 0xffd49a;');
c=s.indexOf('function enemyShoot(');d=s.indexOf('function updateProjs(',c);s=s.slice(0,c)+s.slice(c,d).replaceAll('P.','player.')+s.slice(d);
r('m.shootAnim = 0.35; sfx.laser();',`if(network.role==='host')network.effect({kind:'bullets',from:from.toArray(),dir:dir0.toArray(),speed:T.aim?44:30,count:n,spread:S.spread||0,col});
  m.shootAnim = 0.35; sfx.laser();`);
c=s.indexOf('      playerHitbox.min.set(');d=s.indexOf('      pos.addScaledVector(p.v, dt);',c);
s=s.slice(0,c)+`      let hitPlayer=null,hitDistance=Infinity;
      for(const player of network.role==='guest'?[]:combatPlayers()) {
        if(player.dead)continue;
        playerHitbox.min.set(player.pos.x-.36,player.pos.y+.1,player.pos.z-.36);playerHitbox.max.set(player.pos.x+.36,player.pos.y+CFG.eye+.12,player.pos.z+.36);
        const hit=projectileRay.ray.intersectBox(playerHitbox,bulletHit),distance=hit?pos.distanceTo(bulletHit):Infinity;
        if(distance<hitDistance){hitDistance=distance;hitPlayer=player;}
      }
      if(hitPlayer&&hitDistance<=step&&(!wall||hitDistance<wall.distance)){hurtTarget(hitPlayer,p.dmg);dead=true;}
      else if(wall){emit('spark',wall.point,4,3,.3,.7,.3);dead=true;}
`+s.slice(d);
r('const d = Math.hypot(P.pos.x - m.x, P.pos.z - m.z);\n      if (!P.dead && d < 9 && P.pos.y < (m.y || 0) + 0.9) hurtPlayer(m.T.dmg * (1 - d / 12));',`for(const player of combatPlayers()) {const d=Math.hypot(player.pos.x-m.x,player.pos.z-m.z);if(!player.dead&&d<9&&player.pos.y<(m.y||0)+.9)hurtTarget(player,m.T.dmg*(1-d/12));}`);
r('&& !P.dead) { m.slamT = 0.9;',"&& !closestPlayer(m).dead) { m.slamT = 0.9;");
r('function closeShop() {\n',`function closeShop() {
  if(network.role==='guest'){$('shop').classList.add('hidden');state.shopOpen=false;state.paused=false;lock();banner('READY · WAITING FOR THE HOST');return;}
`);
r('function die() { endMatch(false); }',`function die() {if(network.role){P.dead=true;P.deadT=0;banner('DOWN · RESPAWNING IN 8 SECONDS');return;}endMatch(false);}`);
r('if (P.dead) { P.deadT += dt; return; }',`if(P.dead){P.deadT+=dt;if(network.role&&P.deadT>8){P.dead=false;P.deadT=0;P.hp=P.maxHp*.75;P.spawnShield=5;P.damageGrace=0;P.pos.copy(state.coopSpawn||new THREE.Vector3(state.map.start[0],state.map.startY||0,state.map.start[1]));P.vel.set(0,0,0);banner('BACK IN THE FIGHT');}return;}`);
r('function update(dt) {\n',`function update(dt) {
  if(network.role==='guest'&&state.hostPaused){updateCamera(dt);updateHUD(dt);return;}
`);
r('operations.update(dt); updateWaves(dt); updateMonsters(dt); updateBarrels(dt); updateC4(dt);',`operations.update(dt);
  if(network.role==='guest')updateGuestMonsters(dt);else{updateWaves(dt);updateMonsters(dt);updateBarrels(dt);}
  updateC4(dt);updateRemotePlayers(dt);`);
r('const ambientOn = state.mode',`network.tick(now/1000,{pos:P.pos.toArray(),yaw:P.yaw,hp:P.hp,active:state.mode==='playing',moving:Math.hypot(P.vel.x,P.vel.z)>.5},state.map&&network.role==='host'?coopSnapshot:null);
  const ambientOn = state.mode`);
r('async function startGame(key) {','async function startGame(key,setup=null) {');
r('P.pos.set(state.map.start[0], state.map.startY || 0, state.map.start[1]); P.vel.set(0, 0, 0); P.yaw = Math.atan2(P.pos.x, P.pos.z);',`P.pos.set(state.map.start[0],state.map.startY||0,state.map.start[1]);
  if(setup){P.pos.fromArray(setup.spawn);const offset=Number(network.id?.slice(1)||1)%3;P.pos.x+=offset*1.2;const floor=state.collMesh?floorAt(P.pos.x,P.pos.z,P.pos.y+.6,2):0;if(floor!==null)P.pos.y=floor;state.gameMode=setup.gameMode;state.difficulty=setup.difficulty;}
  state.coopSpawn=P.pos.clone();P.vel.set(0,0,0);P.yaw=Math.atan2(P.pos.x,P.pos.z);`);
r('startWave(1); lock();',`if(network.role==='guest'){state.wave=1;state.toSpawn=0;operations.start(1);if(pendingSnapshot){applyCoopSnapshot(pendingSnapshot);pendingSnapshot=null;}}
  else{startWave(1);if(network.role==='host')network.start({mapKey:key,spawn:P.pos.toArray(),gameMode:state.gameMode,difficulty:state.difficulty});}
  lock();`);
r("if (e.code === 'KeyE') operations.input(true);","if(e.code==='KeyE'){operations.input(true);if(network.role==='guest')network.action({kind:'interact',held:true});}");
r("if (e.code === 'KeyE') operations.input(false);", "if(e.code==='KeyE'){operations.input(false);if(network.role==='guest')network.action({kind:'interact',held:false});}");
r('function showPause() { operations.input(false);','function showPause() { if(network.role===\'guest\')network.action({kind:\'interact\',held:false});operations.input(false);');
r('giveAmmo(); state.score += 200 * state.wave;',`if(network.role==='host')for(const player of network.players.values())if(player.id!==network.id)network.direct(player.id,'sector',{credits:200*state.wave,heal:35});
    giveAmmo(); state.score += 200 * state.wave;`);
r('reward:n=>{state.score+=n;state.credits+=n;},refill:giveAmmo,sound:()=>sfx.pickup()','reward:n=>{state.score+=n;state.credits+=n;if(network.role===\'host\')for(const p of network.players.values())if(p.id!==network.id)network.direct(p.id,\'reward\',{points:n});},refill:giveAmmo,sound:()=>sfx.pickup(),\n  requestPickup:id=>network.action({kind:\'pickup\',id}),grantPickup:(id,kind)=>network.direct(id,\'pickup\',{kind}),remoteInteractions:()=>[...remoteHeld].filter(([,held])=>held).map(([id,held])=>{const p=network.players.get(id)?.position;return {held:held&&p?.active&&p.hp>0,pos:new THREE.Vector3(...(p?.pos||[9999,9999,9999]))};})');
fs.writeFileSync('public/js/main.js',s);
