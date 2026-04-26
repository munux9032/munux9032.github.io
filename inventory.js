'use strict';
const INV={
  hotbar:Array.from({length:9},()=>({id:0,count:0})),
  main:  Array.from({length:27},()=>({id:0,count:0})),
  offhand:{id:0,count:0},
  active:0,
  activeItem(){return this.hotbar[this.active];},
  setActive(i){this.active=clamp(i,0,8);},

  _addArr(arr,id,cnt){
    const mx=iMaxStack(id);
    for(const s of arr){
      if(s.id===id&&s.count<mx){const a=Math.min(cnt,mx-s.count);s.count+=a;cnt-=a;if(!cnt)return 0;}
    }
    for(const s of arr){
      if(s.id===0){const a=Math.min(cnt,mx);s.id=id;s.count=a;cnt-=a;if(!cnt)return 0;}
    }
    return cnt;
  },
  addItem(id,cnt){
    if(!id||cnt<=0)return;
    let r=this._addArr(this.hotbar,id,cnt);
    if(r>0)this._addArr(this.main,id,r);
  },
  consumeSlot(s,n){s.count-=n;if(s.count<=0){s.id=0;s.count=0;}},
  consumeActive(n){this.consumeSlot(this.hotbar[this.active],n);},
  consumeOH(n){this.consumeSlot(this.offhand,n);},
  swapHands(){
    const a=this.hotbar[this.active];
    const ti=a.id,tc=a.count;
    a.id=this.offhand.id;a.count=this.offhand.count;
    this.offhand.id=ti;this.offhand.count=tc;
  }
};

/* ── サバイバル初期アイテム ── */
function initInventory(){
  INV.hotbar[0].id=ITM.WOOD_SHOVEL;INV.hotbar[0].count=1;
}

/* ═══════════════════════════════════════════
   ドラッグ&ドロップ + ダブルタップ半分取り
   ═══════════════════════════════════════════ */
let drag=null; // {id,count,srcArr,srcIdx} | null

/* ダブルタップ検出用 */
const _lastTap={arr:null,idx:null,t:0};
const DBL_MS=320; // ダブルタップ判定ミリ秒

/* スロット配列クリック/タップ共通ハンドラ */
function slotClick(arr,idx){
  const s=arr[idx];
  const now=Date.now();
  /* ── ダブルタップ: 手に何も持ってない & 同スロット再タップ ── */
  if(!drag&&s.id&&_lastTap.arr===arr&&_lastTap.idx===idx&&(now-_lastTap.t)<DBL_MS){
    _lastTap.t=0; // リセット
    const half=Math.ceil(s.count/2);
    const remain=s.count-half;
    drag={id:s.id,count:half,srcArr:arr,srcIdx:idx};
    if(remain>0){s.count=remain;}
    else{s.id=0;s.count=0;}
    return;
  }
  _lastTap.arr=arr;_lastTap.idx=idx;_lastTap.t=now;

  /* ── 通常シングルタップ ── */
  if(!drag){
    if(!s.id)return;
    drag={id:s.id,count:s.count,srcArr:arr,srcIdx:idx};
    s.id=0;s.count=0;
  }else{
    if(!s.id){
      /* 空スロットに置く */
      s.id=drag.id;s.count=drag.count;drag=null;
    }else if(s.id===drag.id&&iStackable(drag.id)){
      /* 同種スタック合算 */
      const mx=iMaxStack(drag.id);
      const a=Math.min(drag.count,mx-s.count);
      s.count+=a;drag.count-=a;
      if(!drag.count)drag=null;
    }else{
      /* 異種スワップ */
      const ti=s.id,tc=s.count;
      s.id=drag.id;s.count=drag.count;
      drag={id:ti,count:tc,srcArr:arr,srcIdx:idx};
    }
  }
}

/* オフハンドスロット */
function ohClick(){
  const s=INV.offhand;
  const now=Date.now();
  if(!drag&&s.id&&_lastTap.arr===INV.offhand&&_lastTap.idx===0&&(now-_lastTap.t)<DBL_MS){
    _lastTap.t=0;
    const half=Math.ceil(s.count/2);
    const remain=s.count-half;
    drag={id:s.id,count:half,srcArr:null,srcIdx:-1};
    if(remain>0){s.count=remain;}else{s.id=0;s.count=0;}
    return;
  }
  _lastTap.arr=INV.offhand;_lastTap.idx=0;_lastTap.t=now;
  if(!drag){
    if(!s.id)return;
    drag={id:s.id,count:s.count,srcArr:null,srcIdx:-1};
    s.id=0;s.count=0;
  }else{
    if(!s.id){s.id=drag.id;s.count=drag.count;drag=null;}
    else{const ti=s.id,tc=s.count;s.id=drag.id;s.count=drag.count;drag={id:ti,count:tc,srcArr:null,srcIdx:-1};}
  }
}

/* クラフトグリッドスロット（grid=配列, idx=インデックス） */
function craftSlotClick(grid,idx){
  slotClick(grid,idx); // 同じロジック流用
}

/* ドラッグキャンセル（画面を閉じるとき） */
function cancelDrag(){
  if(!drag)return;
  if(drag.srcArr&&drag.srcIdx>=0){
    const s=drag.srcArr[drag.srcIdx];
    if(!s.id){s.id=drag.id;s.count=drag.count;}
    else INV.addItem(drag.id,drag.count);
  }else{
    INV.addItem(drag.id,drag.count);
  }
  drag=null;
}
