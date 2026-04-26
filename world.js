'use strict';
let WD=null;
function widx(x,y,z){return(y*WORLD_D+z)*WORLD_W+x}
function inB(x,y,z){return x>=0&&x<WORLD_W&&y>=0&&y<WORLD_H&&z>=0&&z<WORLD_D}
function getB(x,y,z){
  const xi=x|0,yi=y|0,zi=z|0;
  if(!inB(xi,yi,zi))return BLK.AIR;
  return WD[widx(xi,yi,zi)];
}
function setB(x,y,z,id){
  const xi=x|0,yi=y|0,zi=z|0;
  if(!inB(xi,yi,zi))return;
  WD[widx(xi,yi,zi)]=id;
}
function hash2(x,z){
  let n=((x*1619)^(z*31337)+1013904223)|0;
  n=(Math.imul(n^(n>>>16),0x45d9f3b))|0;
  n=(n^(n>>>16))|0;
  return(n>>>0)/0xffffffff;
}
function interp(x,z){
  const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz;
  return lerp(lerp(hash2(ix,iz),hash2(ix+1,iz),smoothstep(fx)),
              lerp(hash2(ix,iz+1),hash2(ix+1,iz+1),smoothstep(fx)),smoothstep(fz));
}
function terrainH(x,z){
  return Math.floor(interp(x/22,z/22)*8+interp(x/10,z/10)*3.5+interp(x/5,z/5)*1.5+11);
}
function generateWorld(){
  WD=new Uint8Array(WORLD_W*WORLD_H*WORLD_D);
  for(let bz=0;bz<WORLD_D;bz++)for(let bx=0;bx<WORLD_W;bx++){
    const sy=clamp(terrainH(bx,bz),2,WORLD_H-3);
    setB(bx,0,bz,BLK.BEDROCK);
    for(let y=1;y<sy-3;y++){
      const r=hash2(bx*7+y*13,bz*11+y*3);
      if(y<=8&&r<.012)      setB(bx,y,bz,BLK.DIAMOND_ORE);
      else if(r<.025)       setB(bx,y,bz,BLK.COAL_ORE);
      else if(r<.040)       setB(bx,y,bz,BLK.IRON_ORE);
      else if(y<=14&&r<.048)setB(bx,y,bz,BLK.GOLD_ORE);
      else                  setB(bx,y,bz,BLK.STONE);
    }
    for(let y=Math.max(1,sy-3);y<sy;y++)setB(bx,y,bz,BLK.DIRT);
    if(sy>=22)     setB(bx,sy,bz,BLK.SNOW);
    else if(sy<=8) setB(bx,sy,bz,BLK.SAND);
    else           setB(bx,sy,bz,BLK.GRASS);
  }
  for(let bz=4;bz<WORLD_D-4;bz++)for(let bx=4;bx<WORLD_W-4;bx++){
    if(hash2(bx*23+41,bz*17+89)<.018){
      const sy=terrainH(bx,bz);
      if(sy>=9&&sy<=20&&getB(bx,sy,bz)===BLK.GRASS)placeTree(bx,sy+1,bz);
    }
  }
}
function placeTree(bx,by,bz){
  const th=4+(hash2(bx,bz)<.5?1:0);
  for(let y=0;y<th;y++)if(by+y<WORLD_H)setB(bx,by+y,bz,BLK.OAK_LOG);
  for(let dy=-1;dy<=2;dy++){
    const ly=by+th-1+dy;if(ly<0||ly>=WORLD_H)continue;
    const r=dy<=0?2:1;
    for(let dx=-r;dx<=r;dx++)for(let dz2=-r;dz2<=r;dz2++){
      if(Math.abs(dx)===r&&Math.abs(dz2)===r)continue;
      const lx=bx+dx,lz=bz+dz2;
      if(lx>=0&&lx<WORLD_W&&lz>=0&&lz<WORLD_D&&getB(lx,ly,lz)===BLK.AIR)
        setB(lx,ly,lz,BLK.OAK_LEAVES);
    }
  }
  if(by+th+1<WORLD_H)setB(bx,by+th+1,bz,BLK.OAK_LEAVES);
}

/* DDAレイキャスト
   face: 「当たった面の向き」= 光線がどの方向からブロックに入ったか
   sx>0(東進)→ ブロックの西面(-X)に入る → face='west'
   sy>0(上進)→ ブロックの下面(-Y)に入る → face='down'
   sz>0(南進)→ ブロックの北面(-Z)に入る → face='north'  */
function raycast(ox,oy,oz,dx,dy,dz,maxD){
  const len=Math.sqrt(dx*dx+dy*dy+dz*dz);
  if(len<1e-8)return null;
  dx/=len;dy/=len;dz/=len;
  let x=Math.floor(ox),y=Math.floor(oy),z=Math.floor(oz);
  const sx=dx>0?1:-1,sy=dy>0?1:-1,sz=dz>0?1:-1;
  const tdx=Math.abs(dx)>1e-8?Math.abs(1/dx):Infinity;
  const tdy=Math.abs(dy)>1e-8?Math.abs(1/dy):Infinity;
  const tdz=Math.abs(dz)>1e-8?Math.abs(1/dz):Infinity;
  let tmx=(dx>0?x+1-ox:ox-x)*tdx;
  let tmy=(dy>0?y+1-oy:oy-y)*tdy;
  let tmz=(dz>0?z+1-oz:oz-z)*tdz;
  if(tmx<1e-8)tmx+=tdx;
  if(tmy<1e-8)tmy+=tdy;
  if(tmz<1e-8)tmz+=tdz;
  let face=null,t=0;
  for(let i=0;i<300;i++){
    if(t>maxD)break;
    if(inB(x,y,z)){
      const b=WD[widx(x,y,z)];
      if(b!==BLK.AIR&&!isTrans(b))return{x,y,z,id:b,face};
    }
    if(tmx<tmy&&tmx<tmz){
      t=tmx;x+=sx;tmx+=tdx;
      face=sx>0?'west':'east';
    }else if(tmy<tmz){
      t=tmy;y+=sy;tmy+=tdy;
      face=sy>0?'down':'up';
    }else{
      t=tmz;z+=sz;tmz+=tdz;
      face=sz>0?'north':'south';
    }
  }
  return null;
}
function placePos(hit){
  if(!hit||!hit.face)return null;
  const o=FOFF[hit.face];
  return{x:hit.x+o[0],y:hit.y+o[1],z:hit.z+o[2]};
}
