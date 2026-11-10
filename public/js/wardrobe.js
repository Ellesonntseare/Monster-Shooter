import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildHero } from './hero.js';
import { HEROES,selectedHero } from './roster.js';
const $=id=>document.getElementById(id);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.prepend(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x08191e);scene.fog=new THREE.Fog(0x08191e,6,15);
scene.add(new THREE.HemisphereLight(0xe5ffff,0x26362f,2.4));const key=new THREE.DirectionalLight(0xffedda,3);key.position.set(3,4,5);scene.add(key);const rim=new THREE.DirectionalLight(0x70ffcf,2);rim.position.set(-3,3,-3);scene.add(rim);
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.01,100);camera.position.set(.25,1.18,3.9);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.92,0);controls.enableDamping=true;controls.minDistance=.5;controls.maxDistance=6;controls.maxPolarAngle=Math.PI*.55;
const platform=new THREE.Mesh(new THREE.CylinderGeometry(.64,.7,.07,64),new THREE.MeshStandardMaterial({color:0x213a3c,metalness:.6,roughness:.4}));platform.position.y=-.045;scene.add(platform);
const ringMaterial=new THREE.MeshBasicMaterial({color:0xa4ffe1});
const ring=new THREE.Mesh(new THREE.TorusGeometry(.62,.008,8,64),ringMaterial);ring.rotation.x=Math.PI/2;scene.add(ring);
const grid=new THREE.GridHelper(40,80,0x385551,0x152d30);grid.position.y=-.09;scene.add(grid);
let hero,loading=false,index=HEROES.findIndex(h=>h.id===selectedHero().id),close=false,previewWalk=false;
function resetCamera(){close=false;camera.position.set(.25,1.18,3.9);controls.target.set(0,.92,0);$('inspect').textContent='INSPECT FACE +';}
function writeProfile(config){
 $('hero-number').textContent=`OPERATOR ${String(index+1).padStart(2,'0')} / ${String(HEROES.length).padStart(2,'0')}`;$('hero-name').textContent=config.name;$('hero-role').textContent=config.role;$('hero-description').textContent=config.description;$('hero-trait').textContent=config.trait;$('hero-trait-info').textContent=config.traitInfo;
 document.querySelector('.backdrop-word').textContent=config.name;$('health-value').textContent=config.hp+' HP';$('speed-value').textContent=config.speed.toFixed(1)+' m/s';$('reload-value').textContent=(2*config.reload).toFixed(1)+' s';
 $('health-bar').style.width=config.hp/160*100+'%';$('speed-bar').style.width=config.speed/7*100+'%';$('reload-bar').style.width=(1.25-config.reload)/.45*100+'%';
 $('roster-position').textContent=`${String(index+1).padStart(2,'0')} / ${String(HEROES.length).padStart(2,'0')}`;$('roster-dots').innerHTML=HEROES.map((h,i)=>`<i class="${i===index?'active':''}"></i>`).join('');$('equip').textContent='DEPLOY AS '+config.name+' ↗';
 document.documentElement.style.setProperty('--accent','#'+config.accent.toString(16).padStart(6,'0'));ringMaterial.color.setHex(config.accent);rim.color.setHex(config.accent);
}
async function show(){if(loading)return;loading=true;$('equip').disabled=true;$('previous').disabled=$('next').disabled=true;const config=HEROES[index];writeProfile(config);$('status').textContent='LOADING OPERATOR…';if(hero)hero.root.visible=false;
try{const next=await buildHero(config.id);if(hero)scene.remove(hero.root);hero=next;scene.add(hero.root);resetCamera();$('status').textContent=config.id==='personal'?'PERSONAL SKIN / YOUR FACE':'OPERATOR READY';$('equip').disabled=false;}catch(e){$('status').textContent='Could not load operator: '+e.message;}
loading=false;$('previous').disabled=$('next').disabled=false;}
$('previous').onclick=()=>{if(!loading){index=(index+HEROES.length-1)%HEROES.length;show();}};$('next').onclick=()=>{if(!loading){index=(index+1)%HEROES.length;show();}};
$('equip').onclick=()=>{try{localStorage.setItem('riftwatch-hero',HEROES[index].id);sessionStorage.setItem('riftwatch-ready','1');}catch{}const room=new URLSearchParams(location.search).get('room');location.href='/?deploy=1'+(room?'&room='+encodeURIComponent(room):'');};
$('inspect').onclick=()=>{if(close)resetCamera();else{close=true;camera.position.set(.06,1.65,.75);controls.target.set(0,1.64,0);$('inspect').textContent='FULL BODY −';}};
$('walk-preview').onclick=()=>{previewWalk=!previewWalk;$('walk-preview').textContent=previewWalk?'STOP WALK PREVIEW':'WALK PREVIEW';};
addEventListener('keydown',e=>{if(e.code==='ArrowLeft')$('previous').click();if(e.code==='ArrowRight')$('next').click();});
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
let previous=performance.now();show();function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-previous)/1000||0);previous=now;if(hero)hero.update(dt,previewWalk,previewWalk?4:0);controls.update();renderer.render(scene,camera);}requestAnimationFrame(frame);

