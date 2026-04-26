'use strict';
const CTL={joy:{x:0,y:0},jumpNow:false,breaking:false,sprinting:false};
let joyTid=null,joyOx=0,joyOy=0;
const JOY_R=52;
let camTid=null,camLx=0,camLy=0;
const CAM_S=0.0038;
let mlocked=false;
const KB={};

const BTN_TOUCH={};
const BTN_DEFS={
  bsneak: {down:()=>{P.sneaking=true;},         up:()=>{P.sneaking=false;}},
  bsprint:{down:()=>{P.sprinting=true;},        up:()=>{P.sprinting=false;}},
  binv:   {down:()=>{toggleInv();},             up:null},
  bswap:  {down:()=>{INV.swapHands();refreshUI();},up:null},
  bbrk:   {down:()=>{CTL.breaking=true;},       up:()=>{CTL.breaking=false;}},
  bjmp:   {down:()=>{CTL.jumpNow=true;},        up:null},
  bplc:   {down:()=>{doInteract();},            up:null},
};

function setupControls(){
  /* ── 左ゾーン: ジョイスティック ── */
  const L=document.getElementById('tzL');
  L.addEventListener('touchstart',e=>{
    e.preventDefault();
    if(joyTid!==null)return;
    const t=e.changedTouches[0];
    joyTid=t.identifier;joyOx=t.clientX;joyOy=t.clientY;
    CTL.joy.x=0;CTL.joy.y=0;
    const ring=document.getElementById('jring');
    ring.style.display='block';
    ring.style.left=(t.clientX-56)+'px';ring.style.top=(t.clientY-56)+'px';
  },{passive:false});
  L.addEventListener('touchmove',e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      if(t.identifier!==joyTid)continue;
      const dx=t.clientX-joyOx,dy=t.clientY-joyOy;
      const d=Math.sqrt(dx*dx+dy*dy),c=Math.min(d,JOY_R),a=Math.atan2(dy,dx);
      CTL.joy.x=(c/JOY_R)*Math.cos(a);CTL.joy.y=(c/JOY_R)*Math.sin(a);
      const dot=document.getElementById('jdot');
      dot.style.transform='translate(calc(-50% + '+(CTL.joy.x*(JOY_R-23))+'px),calc(-50% + '+(CTL.joy.y*(JOY_R-23))+'px))';
    }
  },{passive:false});
  const jEnd=e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      if(t.identifier!==joyTid)continue;
      joyTid=null;CTL.joy.x=0;CTL.joy.y=0;
      document.getElementById('jring').style.display='none';
      document.getElementById('jdot').style.transform='translate(-50%,-50%)';
    }
  };
  L.addEventListener('touchend',jEnd,{passive:false});
  L.addEventListener('touchcancel',jEnd,{passive:false});

  /* ── 右ゾーン: カメラ ── */
  const R=document.getElementById('tzR');
  R.addEventListener('touchstart',e=>{
    e.preventDefault();
    if(camTid!==null)return;
    const t=e.changedTouches[0];camTid=t.identifier;camLx=t.clientX;camLy=t.clientY;
  },{passive:false});
  R.addEventListener('touchmove',e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      if(t.identifier!==camTid)continue;
      P.yaw-=(t.clientX-camLx)*CAM_S;
      P.pitch-=(t.clientY-camLy)*CAM_S;
      P.pitch=clamp(P.pitch,-Math.PI*.499,Math.PI*.499);
      camLx=t.clientX;camLy=t.clientY;
    }
  },{passive:false});
  const cEnd=e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===camTid)camTid=null;};
  R.addEventListener('touchend',cEnd,{passive:false});
  R.addEventListener('touchcancel',cEnd,{passive:false});

  /* ── アクションパネル: 全指対応マルチタッチ ── */
  const actsEl=document.getElementById('acts');
  function getBtnAt(cx,cy){
    const el=document.elementFromPoint(cx,cy);
    if(!el)return null;
    const btn=el.closest('[data-btn]');
    return btn?btn.dataset.btn:null;
  }
  function pressBtn(bid,tid){
    if(!BTN_DEFS[bid])return;
    if(!BTN_TOUCH[bid])BTN_TOUCH[bid]=new Set();
    const was=BTN_TOUCH[bid].size===0;
    BTN_TOUCH[bid].add(tid);
    if(was&&BTN_DEFS[bid].down)BTN_DEFS[bid].down();
    const el=document.querySelector('[data-btn="'+bid+'"]');
    if(el)el.classList.add('ab-active');
  }
  function releaseBtn(bid,tid){
    if(!BTN_TOUCH[bid])return;
    BTN_TOUCH[bid].delete(tid);
    if(BTN_TOUCH[bid].size===0){
      if(BTN_DEFS[bid]&&BTN_DEFS[bid].up)BTN_DEFS[bid].up();
      const el=document.querySelector('[data-btn="'+bid+'"]');
      if(el)el.classList.remove('ab-active');
    }
  }
  /* 各タッチが現在どのボタンにいるか追跡 */
  const tidBtn={};
  actsEl.addEventListener('touchstart',e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      const bid=getBtnAt(t.clientX,t.clientY);
      if(!bid)continue;
      tidBtn[t.identifier]=bid;
      pressBtn(bid,t.identifier);
    }
  },{passive:false});
  actsEl.addEventListener('touchmove',e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      const newBid=getBtnAt(t.clientX,t.clientY);
      const oldBid=tidBtn[t.identifier];
      if(newBid===oldBid)continue;
      if(oldBid)releaseBtn(oldBid,t.identifier);
      if(newBid){tidBtn[t.identifier]=newBid;pressBtn(newBid,t.identifier);}
      else delete tidBtn[t.identifier];
    }
  },{passive:false});
  const actsEnd=e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      const bid=tidBtn[t.identifier];
      if(bid)releaseBtn(bid,t.identifier);
      delete tidBtn[t.identifier];
    }
  };
  actsEl.addEventListener('touchend',actsEnd,{passive:false});
  actsEl.addEventListener('touchcancel',actsEnd,{passive:false});

  /* ── インベントリ/作業台 閉じるボタン ── */
  document.getElementById('invcls').addEventListener('click',()=>closeInv());
  document.getElementById('tablecls').addEventListener('click',()=>closeCraftTable());

  /* ── ホットバースロットタップ ── */
  document.getElementById('hotbar').addEventListener('click',e=>{
    const s=e.target.closest('[data-hi]');
    if(s){INV.setActive(+s.dataset.hi);buildHotbar();}
  });

  /* ── キーボード(PC) ── */
  window.addEventListener('keydown',e=>{
    if(KB[e.code])return;KB[e.code]=true;
    if(e.code==='Space'){e.preventDefault();CTL.jumpNow=true;}
    if(e.code==='KeyE')toggleInv();
    if(e.code==='KeyF'){INV.swapHands();refreshUI();}
    if(e.code==='ShiftLeft'||e.code==='ShiftRight')P.sneaking=true;
    if(e.code==='ControlLeft')P.sprinting=true;
    if(e.code==='Escape'){if(invOpen)closeInv();else if(tableOpen)closeCraftTable();}
    for(let i=1;i<=9;i++)if(e.code==='Digit'+i){INV.setActive(i-1);buildHotbar();}
  });
  window.addEventListener('keyup',e=>{
    KB[e.code]=false;
    if(e.code==='ShiftLeft'||e.code==='ShiftRight')P.sneaking=false;
    if(e.code==='ControlLeft')P.sprinting=false;
  });

  /* ── マウス(PCポインターロック) ── */
  const cvs=document.getElementById('cvs');
  cvs.addEventListener('click',()=>{if(!invOpen&&!tableOpen&&!mlocked)cvs.requestPointerLock();});
  document.addEventListener('pointerlockchange',()=>{
    mlocked=!!document.pointerLockElement;
    if(mlocked)document.addEventListener('mousemove',_onMM);
    else document.removeEventListener('mousemove',_onMM);
  });
  cvs.addEventListener('mousedown',e=>{
    if(!mlocked)return;
    if(e.button===0)CTL.breaking=true;
    if(e.button===2){e.preventDefault();doInteract();}
  });
  cvs.addEventListener('mouseup',e=>{if(e.button===0)CTL.breaking=false;});
  cvs.addEventListener('contextmenu',e=>e.preventDefault());
  cvs.addEventListener('wheel',e=>{
    e.preventDefault();
    INV.setActive((INV.active+(e.deltaY>0?1:-1)+9)%9);buildHotbar();
  },{passive:false});
}

function _onMM(e){
  if(!mlocked||invOpen||tableOpen)return;
  P.yaw-=e.movementX*.0025;P.pitch-=e.movementY*.0025;
  P.pitch=clamp(P.pitch,-Math.PI*.499,Math.PI*.499);
}

function updateKBMove(){
  if(mlocked&&!invOpen&&!tableOpen){
    const fwd=(KB['KeyW']?1:0)-(KB['KeyS']?1:0);
    const str=(KB['KeyD']?1:0)-(KB['KeyA']?1:0);
    if(fwd||str){const l=Math.sqrt(fwd*fwd+str*str);CTL.joy.x=str/l;CTL.joy.y=-fwd/l;}
    else if(joyTid===null){CTL.joy.x=0;CTL.joy.y=0;}
    P.sprinting=!!KB['ControlLeft'];
  }else if(joyTid===null&&!CTL.sprinting){
    CTL.joy.x=0;CTL.joy.y=0;
  }
}
