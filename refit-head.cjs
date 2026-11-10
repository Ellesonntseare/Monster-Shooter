const fs=require('fs');let s=fs.readFileSync('public/js/hero.js','utf8');const a=s.indexOf("  if(skin==='personal') {"),b=s.indexOf('  const mixer=',a);
if(a<0||b<0)throw Error('anchor');s=s.slice(0,a)+`  if(skin==='personal') {
    texture.colorSpace=THREE.SRGBColorSpace;
    const donor=await loadHeadDonor();
    const head=new THREE.Group();head.scale.setScalar(.9);
    const faceMaterial=new THREE.MeshStandardMaterial({map:texture,roughness:.98});
    const skinMaterial=new THREE.MeshStandardMaterial({color:0x744a34,roughness:.98});
    donor.scene.traverse(o=>{
      if(!o.isMesh || !/MI_1041303_(Head|Eyes_0[123])$/.test(o.material?.name||''))return;
      const geo=o.geometry.clone();geo.deleteAttribute('skinIndex');geo.deleteAttribute('skinWeight');
      const pos=geo.attributes.position,uv=new THREE.BufferAttribute(new Float32Array(pos.count*2),2);
      for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);uv.setXY(i,.5+x/.24,(y-1.558)/.255);}
      geo.setAttribute('uv',uv);geo.clearGroups();
      const index=geo.index,front=[],back=[],count=index?index.count:pos.count;
      for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);const z=ids.reduce((n,id)=>n+pos.getZ(id),0)/3,y=ids.reduce((n,id)=>n+pos.getY(id),0)/3;(z>.035 && y>1.575 ? front:back).push(...ids);}
      geo.setIndex([...front,...back]);geo.addGroup(0,front.length,0);geo.addGroup(front.length,back.length,1);
      geo.translate(0,-1.665,0);const mesh=new THREE.Mesh(geo,[faceMaterial,skinMaterial]);mesh.castShadow=true;head.add(mesh);
    });
    // Short curls follow an anatomical scalp; the donor's actual jaw and neck stay intact.
    const hairMaterial=new THREE.MeshStandardMaterial({color:0x141714,roughness:1});
    const scalp=new THREE.Mesh(new THREE.SphereGeometry(1,40,24,0,Math.PI*2,0,1.23),hairMaterial);scalp.position.set(0,.053,-.01);scalp.scale.set(.099,.1,.104);head.add(scalp);
    const curls=new THREE.InstancedMesh(new THREE.SphereGeometry(.003,5,4),hairMaterial,900),dummy=new THREE.Object3D();
    for(let i=0;i<900;i++){const theta=i*2.39996,phi=Math.acos(1-(i+.5)/900*(1-Math.cos(1.23)));dummy.position.set(.1*Math.sin(phi)*Math.cos(theta),.053+.101*Math.cos(phi),-.01+.105*Math.sin(phi)*Math.sin(theta));dummy.updateMatrix();curls.setMatrixAt(i,dummy.matrix);}head.add(curls);
    root.add(head);head.position.set(.018,1.64,.015);root.updateMatrixWorld(true);
    if(bone){const base=bone.getWorldPosition(new THREE.Vector3());head.position.set(base.x,base.y+.09,base.z-.005);root.updateMatrixWorld(true);bone.attach(head);}
  }
`+s.slice(b);s=s.replace('let faceTexture;','let faceTexture;let headDonor;\nfunction loadHeadDonor(){return headDonor ||= new GLTFLoader().loadAsync(\'/models/winter_soldier_-_summer_soldier.glb\');}');fs.writeFileSync('public/js/hero.js',s);
