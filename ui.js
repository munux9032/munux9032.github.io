'use strict';
let invOpen=false;
let tableOpen=false;

/* ═══════ スロット描画ユーティリティ ═══════ */
function fillSlot(el,s){
  el.innerHTML='';
  if(s&&s.id){
    el.appendChild(makeIconCanvas(s.id,32));
    if(s.count>1){const c=document.createElement('span');c.className='cnt';c.textContent=s.count;el.appendChild(c);}
  }
}
function makeSlot(s,active,hiIdx){
  const el=document.createElement('div');
  el.className='slot'+(active?' active':'');
  if(hiIdx!=null)el.dataset.hi=hiIdx;
  fillSlot(el,s);
  return el;
}

/* ═══════ HUD ═══════ */
function buildHotbar(){
  const hb=document.getElementById('hotbar');hb.innerHTML='';
  INV.hotbar.forEach((s,i)=>hb.appendChild(makeSlot(s,i===INV.active,i)));
  buildOffhand();
}
function buildOffhand(){
  const el=document.getElementById('ohslot');
  fillSlot(el,INV.offhand);
  el.onclick=()=>{if(!invOpen&&!tableOpen){INV.swapHands();buildHotbar();}};
}
function buildHP(){
  const bar=document.getElementById('hpbar');bar.innerHTML='';
  for(let i=0;i<10;i++){
    const d=document.createElement('div');
    d.style.cssText='width:11px;height:10px;margin:1px;display:inline-block;'+
      'clip-path:polygon(25% 0%,75% 0%,100% 30%,100% 55%,50% 100%,0% 55%,0% 30%);'+
      'background:'+(i<Math.ceil(P.hp/2)?'#e00':'#444');
    bar.appendChild(d);
  }
}
function buildFood(){
  const bar=document.getElementById('fdbar');bar.innerHTML='';
  for(let i=0;i<10;i++){
    const d=document.createElement('div');
    d.style.cssText='width:10px;height:9px;margin:1px;display:inline-block;border-radius:2px;'+
      'background:'+(i<Math.ceil(P.food/2)?'#a06028':'#444');
    bar.appendChild(d);
  }
}
function buildXP(){document.getElementById('xpfill').style.width=(P.xp%100)+'%';}
function buildTooltip(){
  const tip=document.getElementById('tip');
  const hit=getTarget();
  if(hit)tip.textContent=bName(hit.id);
  else{const a=INV.activeItem();tip.textContent=(a&&a.id)?iName(a.id):'';}
}

/* ═══════ インベントリ画面 (2x2クラフト) ═══════ */
function openInv(){
  invOpen=true;
  document.getElementById('invscr').classList.remove('hidden');
  buildInvScreen();_setupDragFollow('invpanel','dghost');
}
function closeInv(){
  returnCraftGrid(craftState.inv);
  cancelDrag();
  invOpen=false;
  document.getElementById('invscr').classList.add('hidden');
  buildHotbar();
}
function toggleInv(){invOpen?closeInv():openInv();}

function buildInvScreen(){
  _buildCraftGrid('cgrid','cout',craftState.inv,craftState.invOut,4);
  _buildSlotGrid('invmain',INV.main,27,()=>buildInvScreen());
  _buildSlotGrid('invhb',INV.hotbar,9,()=>buildInvScreen(),true);
  _buildIOH();
  _buildGhost('dghost');
}

/* ═══════ 作業台画面 (3x3クラフト) ═══════ */
function openCraftTable(){
  tableOpen=true;
  document.getElementById('tablescr').classList.remove('hidden');
  buildTableScreen();_setupDragFollow('tablepanel','tdghost');
}
function closeCraftTable(){
  returnCraftGrid(craftState.table);
  cancelDrag();
  tableOpen=false;
  document.getElementById('tablescr').classList.add('hidden');
  buildHotbar();
}
function buildTableScreen(){
  _buildCraftGrid('tgrid','tout',craftState.table,craftState.tableOut,9);
  _buildSlotGrid('tmain',INV.main,27,()=>buildTableScreen());
  _buildSlotGrid('thb',INV.hotbar,9,()=>buildTableScreen(),true);
  _buildGhost('tdghost');
}

/* ═══════ 共通ビルダー ═══════ */

/* クラフトグリッド (gridElId=グリッドdivのid, outId=出力スロットid,
   grid=配列, outSlot=出力スロットオブジェクト, size=4|9) */
function _buildCraftGrid(gridElId,outId,grid,outSlot,size){
  /* 結果再計算 */
  const res=calcCraftResult(grid);
  outSlot.id=res.id;outSlot.count=res.count;

  /* グリッド */
  const gEl=document.getElementById(gridElId);if(!gEl)return;
  gEl.innerHTML='';
  const cols=size===4?2:3;
  gEl.style.gridTemplateColumns='repeat('+cols+',var(--slot-sz,44px))';
  for(let i=0;i<size;i++){
    const sl=document.createElement('div');sl.className='slot dark craft-slot';
    fillSlot(sl,grid[i]);
    sl.addEventListener('click',()=>{
      craftSlotClick(grid,i);
      const r2=calcCraftResult(grid);outSlot.id=r2.id;outSlot.count=r2.count;
      if(size===4)buildInvScreen();else buildTableScreen();
    });
    gEl.appendChild(sl);
  }

  /* 出力スロット */
  const oEl=document.getElementById(outId);if(!oEl)return;
  fillSlot(oEl,outSlot);
  oEl.style.cursor=outSlot.id?'pointer':'default';
  oEl.onclick=()=>{
    doCraft(grid,outSlot);
    if(size===4)buildInvScreen();else buildTableScreen();
    refreshUI();
  };
}

/* 汎用スロットグリッド */
function _buildSlotGrid(elId,arr,len,rebuild,isHotbar){
  const el=document.getElementById(elId);if(!el)return;
  el.innerHTML='';
  for(let i=0;i<len;i++){
    const sl=document.createElement('div');
    sl.className='slot dark'+(isHotbar&&i===INV.active?' active':'');
    fillSlot(sl,arr[i]);
    sl.addEventListener('click',()=>{slotClick(arr,i);rebuild();});
    el.appendChild(sl);
  }
}

/* オフハンド（インベントリ内） */
function _buildIOH(){
  const el=document.getElementById('iohslot');if(!el)return;
  el.innerHTML='';fillSlot(el,INV.offhand);
  el.onclick=()=>{ohClick();buildInvScreen();};
}

/* ドラッグゴースト描画 */
function _buildGhost(ghostId){
  const el=document.getElementById(ghostId);if(!el)return;
  if(!drag){el.style.display='none';return;}
  el.style.display='block';el.innerHTML='';
  el.appendChild(makeIconCanvas(drag.id,36));
  if(drag.count>1){const c=document.createElement('span');c.className='cnt';c.textContent=drag.count;el.appendChild(c);}
}

/* ドラッグゴースト追従セットアップ */
function _setupDragFollow(panelId,ghostId){
  const panel=document.getElementById(panelId);
  const g=document.getElementById(ghostId);
  if(!panel||!g)return;
  const mv=(cx,cy)=>{if(drag){g.style.left=cx+'px';g.style.top=cy+'px';}};
  /* 重複登録防止 */
  if(panel._dfSetup)return;
  panel._dfSetup=true;
  panel.addEventListener('mousemove',e=>mv(e.clientX,e.clientY));
  panel.addEventListener('touchmove',e=>{if(e.touches[0])mv(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});
}

/* ═══════ 全体更新 ═══════ */
function refreshUI(){
  buildHotbar();
  if(invOpen)buildInvScreen();
  if(tableOpen)buildTableScreen();
}
function initUI(){buildHotbar();buildHP();buildFood();buildXP();}
function tickUI(){buildTooltip();}

/* iName はitems.jsで定義 */
function iName(id){
  if(id>=1&&id<=20)return bName(id);
  const d=IDATA[id];return d?d.name:'不明';
}
