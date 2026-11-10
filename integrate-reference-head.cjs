const fs=require('fs');let s=fs.readFileSync('public/js/hero.js','utf8');s=s.replace("import { HEROES,selectedHero } from './roster.js';","import { HEROES,selectedHero } from './roster.js';\nimport { buildPersonalHead } from './personal-head.js';");s=s.replace("const templates=new Map();let faceTexture;let headDonor;\nfunction loadHeadDonor(){return headDonor ||= new GLTFLoader().loadAsync('/models/winter_soldier_-_summer_soldier.glb');}","const templates=new Map();let faceTexture;");s=s.replace("'/assets/hero-face.png'","'/assets/serame-head-atlas.png'");const start=s.indexOf("  if(skin==='personal') {"),end=s.indexOf('  const mixer=',start);if(start<0||end<0)throw Error('anchors');s=s.slice(0,start)+`  if(skin==='personal') {
    const head=await buildPersonalHead(texture);head.scale.setScalar(.92);
    root.add(head);root.updateMatrixWorld(true);
    const base=bone ? bone.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0,1.56,0);
    head.position.set(base.x,1.655,base.z-.01);root.updateMatrixWorld(true);
    if(bone)bone.attach(head);
    model.traverse(o=>{if(!o.isMesh)return;const arr=Array.isArray(o.material)?o.material:[o.material];o.material=arr.map(m=>{const material=m.clone();if(['uniform','pouch','boots','gloves'].includes(m.name)&&material.color)material.color.multiplyScalar(.66);return material;});if(!Array.isArray(gltf.scene.getObjectByName(o.name)?.material))o.material=o.material[0];});
  }
`+s.slice(end);fs.writeFileSync('public/js/hero.js',s);
