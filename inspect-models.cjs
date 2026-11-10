const fs=require('fs'),T=require('three');
for(const name of ['office_is_old_abandoned_free.glb','residential_buildings_ancient_villages.glb','new_york_hot_dog_cart.glb','old_gun_cabinet_with_animations.glb','map_ep_73.glb','skibidi_toilet_77_map.glb','drive_for_speed_-_map.glb']) {
const b=fs.readFileSync('models/'+name),g=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12))),box=new T.Box3();let triangles=0;
function visit(i,parent){const n=g.nodes[i],m=new T.Matrix4();if(n.matrix)m.fromArray(n.matrix);else m.compose(new T.Vector3(...(n.translation||[0,0,0])),new T.Quaternion(...(n.rotation||[0,0,0,1])),new T.Vector3(...(n.scale||[1,1,1])));m.premultiply(parent);if(n.mesh!==undefined)for(const p of g.meshes[n.mesh].primitives){const a=g.accessors[p.attributes.POSITION];if(a.min&&a.max)box.union(new T.Box3(new T.Vector3(...a.min),new T.Vector3(...a.max)).applyMatrix4(m));triangles+=(g.accessors[p.indices]?.count||a.count)/3;}for(const c of n.children||[])visit(c,m);}
for(const n of g.scenes[g.scene||0].nodes)visit(n,new T.Matrix4());console.log(name,box.getSize(new T.Vector3()).toArray().map(v=>v.toFixed(2)),Math.round(triangles));
}
