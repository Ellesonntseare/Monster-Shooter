const fs=require('fs');let s=fs.readFileSync('public/js/personal-head.js','utf8');const a=s.indexOf('  // Scalp follows'),b=s.indexOf('  return head;',a);if(a<0||b<0)throw Error('anchor');s=s.slice(0,a)+`  // Dense short curls sit on the real scalp rather than on a spherical cap.
  const hairMaterial=new THREE.MeshStandardMaterial({color:0x040504,roughness:1,side:THREE.DoubleSide});
  if(skull) {
    const scalpGeometry=skull.geometry.clone(),p=scalpGeometry.attributes.position,normals=scalpGeometry.attributes.normal,index=scalpGeometry.index,indices=[];
    for(let i=0;i<index.count;i+=3) {
      const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)];
      if(ids.every(id=>{const y=p.getY(id),z=p.getZ(id),x=Math.abs(p.getX(id));const line=z>.045?.078:z<-.025?-.005:.026+.025*(1-x/.11);return y>line;}))indices.push(...ids);
    }
    scalpGeometry.setIndex(indices);
    for(let i=0;i<p.count;i++){const normal=new THREE.Vector3().fromBufferAttribute(normals,i),point=new THREE.Vector3().fromBufferAttribute(p,i);const crown=THREE.MathUtils.smoothstep(point.y,.07,.125);point.addScaledVector(normal,.005+.017*crown);p.setXYZ(i,point.x,point.y,point.z);}
    scalpGeometry.computeBoundingBox();scalpGeometry.computeBoundingSphere();
    const scalp=new THREE.Mesh(scalpGeometry,hairMaterial);scalp.castShadow=true;head.add(scalp);
    const triangles=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();let total=0;
    for(let i=0;i<indices.length;i+=3){a.fromBufferAttribute(p,indices[i]);b.fromBufferAttribute(p,indices[i+1]);c.fromBufferAttribute(p,indices[i+2]);const area=b.clone().sub(a).cross(c.clone().sub(a)).length()*.5;if(area<1e-9)continue;total+=area;triangles.push({a:a.clone(),b:b.clone(),c:c.clone(),end:total});}
    const count=6500,hair=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.0022,1),hairMaterial,count),dummy=new THREE.Object3D();
    let seed=1927;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<count;i++){const choice=random()*total;let low=0,high=triangles.length-1;while(low<high){const mid=(low+high)>>1;if(triangles[mid].end<choice)low=mid+1;else high=mid;}const t=triangles[low],r=Math.sqrt(random()),v=random();dummy.position.copy(t.a).multiplyScalar(1-r).addScaledVector(t.b,r*(1-v)).addScaledVector(t.c,r*v);dummy.rotation.set(random()*6.28,random()*6.28,random()*6.28);dummy.scale.setScalar(.75+random()*.8);dummy.updateMatrix();hair.setMatrixAt(i,dummy.matrix);}
    hair.computeBoundingSphere();hair.castShadow=true;head.add(hair);
  }
`+s.slice(b);fs.writeFileSync('public/js/personal-head.js',s);
