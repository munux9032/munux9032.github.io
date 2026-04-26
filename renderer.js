'use strict';
let scene,camera,renderer3,hlMesh;
const cMeshes={};

/* MeshLambertMaterial: vertexColors=true, side=THREE.FrontSide（デフォルト）
   透明ブロック(葉・ガラス・氷)用に別マテリアル */
const cMatOpaque=new THREE.MeshLambertMaterial({
  vertexColors:true,
  side:THREE.FrontSide,
  transparent:false,
  depthWrite:true,
});
const cMatTrans=new THREE.MeshLambertMaterial({
  vertexColors:true,
  side:THREE.DoubleSide,   // 透明ブロックは両面描画
  transparent:true,
  opacity:0.82,
  depthWrite:false,        // 透明ブロックはdepthWrite切る
  alphaTest:0.1,
});

function setupRenderer(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x87ceeb);
  scene.fog=new THREE.Fog(0x87ceeb,36,90);
  const W=window.innerWidth,H=window.innerHeight;
  camera=new THREE.PerspectiveCamera(70,W/H,.05,200);
  camera.rotation.order='YXZ';
  renderer3=new THREE.WebGLRenderer({
    canvas:document.getElementById('cvs'),
    antialias:false,
    powerPreference:'high-performance',
  });
  renderer3.setSize(W,H);
  renderer3.setPixelRatio(Math.min(window.devicePixelRatio,1.8));
  renderer3.shadowMap.enabled=false;
  /* ソートで透明物体を後に描画 */
  renderer3.sortObjects=true;

  scene.add(new THREE.AmbientLight(0xffffff,.52));
  const sun=new THREE.DirectionalLight(0xfff8e0,.80);
  sun.position.set(.6,1,.4).normalize();
  scene.add(sun);

  /* ハイライトボックス */
  const hg=new THREE.BoxGeometry(1.012,1.012,1.012);
  const hm=new THREE.MeshBasicMaterial({
    color:0x000000,wireframe:true,transparent:true,opacity:.50,depthTest:true,
  });
  hlMesh=new THREE.Mesh(hg,hm);
  hlMesh.visible=false;
  scene.add(hlMesh);

  window.addEventListener('resize',()=>{
    const W2=window.innerWidth,H2=window.innerHeight;
    camera.aspect=W2/H2;camera.updateProjectionMatrix();
    renderer3.setSize(W2,H2);
  });
}

/* チャンクメッシュ構築
   不透明と透明で頂点バッファを分離し、2つのメッシュを返す */
function buildChunkMesh(cx,cz){
  const posO=[],norO=[],colO=[],idxO=[];
  const posT=[],norT=[],colT=[],idxT=[];
  let viO=0,viT=0;
  const bx0=cx*CHUNK_W,bz0=cz*CHUNK_D;

  for(let ly=0;ly<CHUNK_H;ly++){
    for(let lz=0;lz<CHUNK_D;lz++){
      for(let lx=0;lx<CHUNK_W;lx++){
        const bid=getB(bx0+lx,ly,bz0+lz);
        if(bid===BLK.AIR)continue;
        const isBlockTrans=isTrans(bid);

        for(let fi=0;fi<FACES.length;fi++){
          const f=FACES[fi];
          const nx=f.dir[0],ny=f.dir[1],nz=f.dir[2];
          const nb=getB(bx0+lx+nx,ly+ny,bz0+lz+nz);
          /* 隣が不透明なら面不要（ただし隣が同種透明なら省略） */
          if(!isTrans(nb))continue;
          if(isBlockTrans&&nb===bid)continue; // 同種透明同士は省略

          const fc=bFaceColor(bid,f.dir);
          const br=f.bright;
          const r=fc[0]*br,g=fc[1]*br,b=fc[2]*br;

          if(isBlockTrans){
            const sv=viT;
            for(let ci=0;ci<4;ci++){
              const c=f.corners[ci];
              posT.push(c.p[0]+lx,c.p[1]+ly,c.p[2]+lz);
              norT.push(nx,ny,nz);
              colT.push(r,g,b);
            }
            idxT.push(sv,sv+1,sv+2,sv+2,sv+1,sv+3);
            viT+=4;
          }else{
            const sv=viO;
            for(let ci=0;ci<4;ci++){
              const c=f.corners[ci];
              posO.push(c.p[0]+lx,c.p[1]+ly,c.p[2]+lz);
              norO.push(nx,ny,nz);
              colO.push(r,g,b);
            }
            idxO.push(sv,sv+1,sv+2,sv+2,sv+1,sv+3);
            viO+=4;
          }
        }
      }
    }
  }

  const meshes=[];

  if(posO.length){
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(posO,3));
    geo.setAttribute('normal',  new THREE.Float32BufferAttribute(norO,3));
    geo.setAttribute('color',   new THREE.Float32BufferAttribute(colO,3));
    geo.setIndex(idxO);
    const m=new THREE.Mesh(geo,cMatOpaque);
    m.position.set(bx0,0,bz0);
    meshes.push(m);
  }
  if(posT.length){
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(posT,3));
    geo.setAttribute('normal',  new THREE.Float32BufferAttribute(norT,3));
    geo.setAttribute('color',   new THREE.Float32BufferAttribute(colT,3));
    geo.setIndex(idxT);
    const m=new THREE.Mesh(geo,cMatTrans);
    m.position.set(bx0,0,bz0);
    m.renderOrder=1; // 透明は後描画
    meshes.push(m);
  }
  return meshes;
}

function rebuildChunk(cx,cz){
  if(cx<0||cx>=WORLD_CX||cz<0||cz>=WORLD_CZ)return;
  const k=cx+','+cz;
  if(cMeshes[k]){
    cMeshes[k].forEach(m=>{scene.remove(m);m.geometry.dispose();});
    delete cMeshes[k];
  }
  const ms=buildChunkMesh(cx,cz);
  if(ms.length){
    ms.forEach(m=>scene.add(m));
    cMeshes[k]=ms;
  }
}

function buildAllChunks(){
  for(let cz=0;cz<WORLD_CZ;cz++)for(let cx=0;cx<WORLD_CX;cx++)rebuildChunk(cx,cz);
}

function rebuildAround(bx,by,bz){
  const cx=Math.floor(bx/CHUNK_W),cz=Math.floor(bz/CHUNK_D);
  rebuildChunk(cx,cz);
  if(bx%CHUNK_W===0)          rebuildChunk(cx-1,cz);
  if(bx%CHUNK_W===CHUNK_W-1)  rebuildChunk(cx+1,cz);
  if(bz%CHUNK_D===0)          rebuildChunk(cx,cz-1);
  if(bz%CHUNK_D===CHUNK_D-1)  rebuildChunk(cx,cz+1);
}

function setHighlight(hit){
  if(hit){hlMesh.position.set(hit.x+.5,hit.y+.5,hit.z+.5);hlMesh.visible=true;}
  else hlMesh.visible=false;
}

function renderFrame(){renderer3.render(scene,camera);}
