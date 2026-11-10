const {test}=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
const {WebSocket}=require('ws'),{attachMultiplayer}=require('../multiplayer-server.cjs');
async function client(url){
  const ws=new WebSocket(url),inbox=[],waiters=[];
  ws.on('message',raw=>{const m=JSON.parse(raw);const waiter=waiters.find(w=>w.type===m.type);if(waiter){waiters.splice(waiters.indexOf(waiter),1);clearTimeout(waiter.timer);waiter.resolve(m);}else inbox.push(m);});
  const next=type=>{const index=inbox.findIndex(m=>m.type===type);if(index>=0)return Promise.resolve(inbox.splice(index,1)[0]);return new Promise((resolve,reject)=>{const item={type,resolve,timer:setTimeout(()=>reject(Error('No '+type)),3000)};waiters.push(item);});};
  await next('connected');return {ws,next,send(type,data={}){ws.send(JSON.stringify({type,...data}));}};
}
test('rooms synchronize different heroes, host snapshots, damage actions and disconnects',async()=>{
  const server=http.createServer(),{wss,rooms}=attachMultiplayer(server);await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url='ws://127.0.0.1:'+server.address().port+'/multiplayer';const peers=[];
  try{
    const host=await client(url),guest=await client(url);peers.push(host,guest);
    host.send('create',{name:'Serame',hero:'personal'});const room=await host.next('joined');assert.equal(room.role,'host');assert.match(room.code,/^[A-F0-9]{6}$/);
    guest.send('join',{code:room.code,name:'Friend',hero:'sentinel'});const joined=await guest.next('joined');assert.equal(joined.role,'guest');
    const roster=await guest.next('roster');assert.deepEqual(roster.players.map(p=>p.hero),['personal','sentinel']);
    host.send('start',{mapKey:'outpost',spawn:[0,0,70],difficulty:'relaxed'});assert.equal((await guest.next('start')).mapKey,'outpost');
    guest.send('position',{pos:[2,0,70],yaw:1,hp:160,active:true,moving:true,speed:8});const position=await host.next('position');assert.equal(position.position.hp,160);assert.equal(position.position.moving,true);assert.equal(position.position.speed,8);
    guest.send('position',{pos:[2,0,70],yaw:1,hp:160,active:true,moving:false,speed:0});const stopped=await host.next('position');assert.equal(stopped.position.moving,false);assert.equal(stopped.position.speed,0);
    host.send('snapshot',{snapshot:{monsters:[{id:1,hp:60}],barrels:[],wave:1}});assert.equal((await guest.next('snapshot')).snapshot.monsters[0].hp,60);
    guest.send('action',{action:{kind:'hit',id:1,damage:25,pos:[0,1,40]}});assert.equal((await host.next('action')).action.damage,25);
    host.send('direct',{to:position.id,event:'hurt',data:{damage:7}});assert.equal((await guest.next('hurt')).data.damage,7);
    host.send('direct',{to:position.id,event:'pickup',data:{kind:'med'}});assert.equal((await guest.next('pickup')).data.kind,'med');
    host.send('voice-config');assert.match((await host.next('voice-config')).iceServers[0].urls,/stun/);
    host.send('voice-ready',{enabled:true});guest.send('voice-ready',{enabled:true});
    guest.send('voice-signal',{to:room.host,signal:{description:{type:'offer',sdp:'test-offer'}}});
    assert.equal((await host.next('voice-signal')).signal.description.sdp,'test-offer');
    host.send('voice-signal',{to:position.id,signal:{candidate:{candidate:'test-candidate'}}});
    assert.equal((await guest.next('voice-signal')).signal.candidate.candidate,'test-candidate');
    const late=await client(url);peers.push(late);late.send('join',{code:room.code,name:'Late',hero:'vanguard'});await late.next('joined');await late.next('start');assert.equal((await late.next('snapshot')).snapshot.wave,1);
    host.ws.close();assert.match((await guest.next('closed')).message,/host left/i);assert.equal(rooms.size,0);
  }finally{for(const p of peers)p.ws.terminate();await new Promise(r=>wss.close(r));await new Promise(r=>server.close(r));}
});
test('unknown room codes fail cleanly without creating a room',async()=>{
  const server=http.createServer(),{wss,rooms}=attachMultiplayer(server);await new Promise(r=>server.listen(0,'127.0.0.1',r));const c=await client('ws://127.0.0.1:'+server.address().port+'/multiplayer');
  try{c.send('join',{code:'ABCDEF'});assert.match((await c.next('error')).message,/not found/);assert.equal(rooms.size,0);}finally{c.ws.terminate();await new Promise(r=>wss.close(r));await new Promise(r=>server.close(r));}
});
