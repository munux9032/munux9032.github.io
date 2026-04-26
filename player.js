'use strict';
const P={
  pos:{x:32,y:20,z:32},vel:{x:0,y:0,z:0},
  yaw:0,pitch:0,onGround:false,sneaking:false,sprinting:false,
  hp:20,maxHp:20,food:20,xp:0,
  breakTarget:null,breakAccum:0
};
function initPlayer(){
  const sx=(WORLD_W/2)|0,sz=(WORLD_D/2)|0;
  const sy=terrainH(sx,sz)+2;
  P.pos.x=sx+.5;P.pos.y=sy;P.pos.z=sz+.5;
  P.vel.x=0;P.vel.y=0;P.vel.z=0;P.yaw=0;P.pitch=0;
}
function _aabb(){
  const hw=PLAYER_W*.5;
  return{x0:P.pos.x-hw,x1:P.pos.x+hw,y0:P.pos.y,y1:P.pos.y+PLAYER_HEIGHT,z0:P.pos.z-hw,z1:P.pos.z+hw};
}
function _resolveX(){
  const a=_aabb();
  for(let by=Math.floor(a.y0);by<=Math.floor(a.y1-.001);by++)
  for(let bz=Math.floor(a.z0+.001);bz<=Math.floor(a.z1-.001);bz++){
    for(let bx=Math.floor(a.x0-.01);bx<=Math.floor(a.x1+.01);bx++){
      if(!isSolid(getB(bx,by,bz)))continue;
      if(a.x1>bx+.001&&a.x0<bx+.999&&a.y1>by+.001&&a.y0<by+.999&&a.z1>bz+.001&&a.z0<bz+.999){
        if(P.vel.x>0)P.pos.x=bx-PLAYER_W*.5-.002;
        else         P.pos.x=bx+1+PLAYER_W*.5+.002;
        P.vel.x=0;return;
      }
    }
  }
}
function _resolveY(){
  const a=_aabb();
  for(let bx=Math.floor(a.x0+.001);bx<=Math.floor(a.x1-.001);bx++)
  for(let bz=Math.floor(a.z0+.001);bz<=Math.floor(a.z1-.001);bz++){
    for(let by=Math.floor(a.y0-.01);by<=Math.floor(a.y1+.01);by++){
      if(!isSolid(getB(bx,by,bz)))continue;
      if(a.x1>bx+.001&&a.x0<bx+.999&&a.y1>by+.001&&a.y0<by+.999&&a.z1>bz+.001&&a.z0<bz+.999){
        if(P.vel.y>0)P.pos.y=by-PLAYER_HEIGHT-.002;
        else{P.pos.y=by+1+.002;P.onGround=true;}
        P.vel.y=0;return;
      }
    }
  }
}
function _resolveZ(){
  const a=_aabb();
  for(let by=Math.floor(a.y0);by<=Math.floor(a.y1-.001);by++)
  for(let bx=Math.floor(a.x0+.001);bx<=Math.floor(a.x1-.001);bx++){
    for(let bz=Math.floor(a.z0-.01);bz<=Math.floor(a.z1+.01);bz++){
      if(!isSolid(getB(bx,by,bz)))continue;
      if(a.x1>bx+.001&&a.x0<bx+.999&&a.y1>by+.001&&a.y0<by+.999&&a.z1>bz+.001&&a.z0<bz+.999){
        if(P.vel.z>0)P.pos.z=bz-PLAYER_W*.5-.002;
        else         P.pos.z=bz+1+PLAYER_W*.5+.002;
        P.vel.z=0;return;
      }
    }
  }
}
function updatePlayer(dt){
  const spd=P.sneaking?SPD_SNEAK:P.sprinting?SPD_SPRINT:SPD_WALK;
  const sinY=Math.sin(P.yaw),cosY=Math.cos(P.yaw);
  const jx=CTL.joy.x,jy=CTL.joy.y;
  P.vel.x=(-jy*(-sinY)+jx*cosY)*spd;
  P.vel.z=(-jy*(-cosY)+jx*(-sinY))*spd;
  if(!P.onGround)P.vel.y=Math.max(P.vel.y+GRAVITY*dt,TERM_V);
  if(CTL.jumpNow&&P.onGround){P.vel.y=JUMP_V;P.onGround=false;}
  CTL.jumpNow=false;P.onGround=false;
  P.pos.x+=P.vel.x*dt;_resolveX();
  P.pos.y+=P.vel.y*dt;_resolveY();
  P.pos.z+=P.vel.z*dt;_resolveZ();
  const hw=PLAYER_W*.5+.01;
  P.pos.x=clamp(P.pos.x,hw,WORLD_W-hw);
  P.pos.z=clamp(P.pos.z,hw,WORLD_D-hw);
  if(P.pos.y<-6){_respawn();return;}
  camera.position.set(P.pos.x,P.pos.y+PLAYER_EYE,P.pos.z);
  camera.rotation.y=P.yaw;camera.rotation.x=P.pitch;
  _updateBreaking(dt);
}
function _respawn(){
  const sx=(WORLD_W/2)|0,sz=(WORLD_D/2)|0;
  P.pos.x=sx+.5;P.pos.y=terrainH(sx,sz)+4;P.pos.z=sz+.5;
  P.vel.x=0;P.vel.y=0;P.vel.z=0;P.hp=P.maxHp;
}
function getTarget(){
  return raycast(
    P.pos.x,P.pos.y+PLAYER_EYE,P.pos.z,
    -Math.sin(P.yaw)*Math.cos(P.pitch),
    -Math.sin(P.pitch),
    -Math.cos(P.yaw)*Math.cos(P.pitch),
    REACH
  );
}
function _updateBreaking(dt){
  const wrap=document.getElementById('bkwrap');
  const fill=document.getElementById('bkfill');
  if(!CTL.breaking){
    P.breakAccum=0;P.breakTarget=null;
    if(wrap)wrap.style.display='none';return;
  }
  const hit=getTarget();
  if(!hit){P.breakAccum=0;P.breakTarget=null;if(wrap)wrap.style.display='none';return;}
  if(!P.breakTarget||P.breakTarget.x!==hit.x||P.breakTarget.y!==hit.y||P.breakTarget.z!==hit.z){
    P.breakTarget=hit;P.breakAccum=0;
  }
  const h=hardness(hit.id);
  if(h===Infinity){if(wrap)wrap.style.display='none';return;}
  P.breakAccum+=dt;
  const bt=Math.max(.15,h*.7),prog=Math.min(P.breakAccum/bt,1);
  if(wrap){wrap.style.display='block';fill.style.width=(prog*100)+'%';}
  if(prog>=1){
    _doBreak(hit.x,hit.y,hit.z,hit.id);
    P.breakAccum=0;P.breakTarget=null;
    if(wrap)wrap.style.display='none';
  }
}
function _doBreak(bx,by,bz,bid){
  setB(bx,by,bz,BLK.AIR);
  rebuildAround(bx,by,bz);
  const drop=bDrop(bid);
  if(drop)INV.addItem(drop,1);
  refreshUI();
}
function doPlace(){
  const hit=getTarget();
  if(!hit||!hit.face)return;
  const pp=placePos(hit);
  if(!pp||!inB(pp.x,pp.y,pp.z))return;
  if(getB(pp.x,pp.y,pp.z)!==BLK.AIR)return;
  const hw=PLAYER_W*.5+.05;
  if(pp.x+1>P.pos.x-hw&&pp.x<P.pos.x+hw&&
     pp.y+1>P.pos.y    &&pp.y<P.pos.y+PLAYER_HEIGHT&&
     pp.z+1>P.pos.z-hw &&pp.z<P.pos.z+hw)return;
  const act=INV.activeItem();
  if(act&&act.id>=1&&act.id<=20){
    setB(pp.x,pp.y,pp.z,act.id);rebuildAround(pp.x,pp.y,pp.z);INV.consumeActive(1);refreshUI();return;
  }
  const oh=INV.offhand;
  if(oh&&oh.id>=1&&oh.id<=20){
    setB(pp.x,pp.y,pp.z,oh.id);rebuildAround(pp.x,pp.y,pp.z);INV.consumeOH(1);refreshUI();return;
  }
}
function doInteract(){
  const hit=getTarget();
  if(!hit)return;
  if(hit.id===BLK.CRAFT_TABLE){openCraftTable();return;}
  doPlace();
}
