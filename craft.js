'use strict';
const craftState={
  inv:  Array.from({length:4},()=>({id:0,count:0})),
  table:Array.from({length:9},()=>({id:0,count:0})),
  invOut:  {id:0,count:0},
  tableOut:{id:0,count:0},
};

/* ═══════════ レシピ照合ユーティリティ ═══════════ */
function _cnt(g,id){return g.reduce((n,s)=>n+(s.id===id?s.count:0),0);}
function _total(g){return g.reduce((n,s)=>n+(s.id?s.count:0),0);}
function _consumeN(g,id,n){
  for(const s of g){if(s.id!==id)continue;const a=Math.min(s.count,n);s.count-=a;if(!s.count)s.id=0;n-=a;if(!n)return;}
}
/* 2x2形状照合: g[0..3], shape=['AB','CD'], items={A:id,...} */
function _match2(g,shape,items){
  for(let r=0;r<2;r++)for(let c=0;c<2;c++){
    const ch=shape[r][c],s=g[r*2+c];
    const need=ch==='.'?0:(items[ch]||0);
    if(!need){if(s.id)return false;}
    else{if(s.id!==need||s.count<1)return false;}
  }
  return true;
}
function _consume2(g,shape,items){
  for(let r=0;r<2;r++)for(let c=0;c<2;c++){if(shape[r][c]!=='.')g[r*2+c].count--;g.forEach(s=>{if(s.count<=0){s.id=0;s.count=0;}});}
}
/* 3x3形状照合 */
function _match3(g,shape,items){
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){
    const ch=shape[r][c],s=g[r*3+c];
    const need=ch==='.'?0:(items[ch]||0);
    if(!need){if(s.id)return false;}
    else{if(s.id!==need||s.count<1)return false;}
  }
  return true;
}
function _consume3(g,shape,items){
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){if(shape[r][c]!=='.')g[r*3+c].count--;}
  g.forEach(s=>{if(s.count<=0){s.id=0;s.count=0;}});
}

/* ═══════════ レシピ一覧 ═══════════ */
const RECIPES=[
  /* 原木→板材4 (shapeless 2x2/3x3 どちらでも) */
  {match:g=>_cnt(g,BLK.OAK_LOG)>=1&&_total(g)===1, out:{id:BLK.OAK_PLANKS,count:4},
   consume:g=>_consumeN(g,BLK.OAK_LOG,1)},
  /* 板材2(縦)→棒4 */
  {match:g=>_cnt(g,BLK.OAK_PLANKS)>=2&&_total(g)===2, out:{id:ITM.STICK,count:4},
   consume:g=>_consumeN(g,BLK.OAK_PLANKS,2)},
  /* 板材4(2x2)→作業台 */
  {match:g=>g.length===4&&_match2(g,['AA','AA'],{A:BLK.OAK_PLANKS}), out:{id:BLK.CRAFT_TABLE,count:1},
   consume:g=>_consume2(g,['AA','AA'],{A:BLK.OAK_PLANKS})},
  /* 丸石4(2x2)→レンガブロック */
  {match:g=>g.length===4&&_match2(g,['CC','CC'],{C:BLK.COBBLE}), out:{id:BLK.BRICK,count:1},
   consume:g=>_consume2(g,['CC','CC'],{C:BLK.COBBLE})},
  /* 石のつるはし (3x3) */
  {match:g=>g.length===9&&_match3(g,['CCC','.S.','.S.'],{C:BLK.COBBLE,S:ITM.STICK}), out:{id:ITM.STONE_PICK,count:1},
   consume:g=>_consume3(g,['CCC','.S.','.S.'],{C:BLK.COBBLE,S:ITM.STICK})},
  /* 木のつるはし (3x3) */
  {match:g=>g.length===9&&_match3(g,['PPP','.S.','.S.'],{P:BLK.OAK_PLANKS,S:ITM.STICK}), out:{id:ITM.STONE_PICK,count:1},
   consume:g=>_consume3(g,['PPP','.S.','.S.'],{P:BLK.OAK_PLANKS,S:ITM.STICK})},
  /* 石の剣 (3x3) */
  {match:g=>g.length===9&&_match3(g,['.C.','.C.','.S.'],{C:BLK.COBBLE,S:ITM.STICK}), out:{id:ITM.WOOD_SWORD,count:1},
   consume:g=>_consume3(g,['.C.','.C.','.S.'],{C:BLK.COBBLE,S:ITM.STICK})},
  /* 木の剣 (3x3) */
  {match:g=>g.length===9&&_match3(g,['.P.','.P.','.S.'],{P:BLK.OAK_PLANKS,S:ITM.STICK}), out:{id:ITM.WOOD_SWORD,count:1},
   consume:g=>_consume3(g,['.P.','.P.','.S.'],{P:BLK.OAK_PLANKS,S:ITM.STICK})},
  /* 石の斧 */
  {match:g=>g.length===9&&_match3(g,['CC.','.S.','.S.'],{C:BLK.COBBLE,S:ITM.STICK}), out:{id:ITM.IRON_AXE,count:1},
   consume:g=>_consume3(g,['CC.','.S.','.S.'],{C:BLK.COBBLE,S:ITM.STICK})},
  /* 石のシャベル */
  {match:g=>g.length===9&&_match3(g,['.C.','.S.','.S.'],{C:BLK.COBBLE,S:ITM.STICK}), out:{id:ITM.WOOD_SHOVEL,count:1},
   consume:g=>_consume3(g,['.C.','.S.','.S.'],{C:BLK.COBBLE,S:ITM.STICK})},
  /* たいまつ: 棒+炭 shapeless */
  {match:g=>_cnt(g,ITM.COAL)>=1&&_cnt(g,ITM.STICK)>=1&&_total(g)===2, out:{id:ITM.TORCH,count:4},
   consume:g=>{_consumeN(g,ITM.COAL,1);_consumeN(g,ITM.STICK,1);}},
  /* 矢: 棒+羽根 shapeless */
  {match:g=>_cnt(g,ITM.STICK)>=1&&_cnt(g,ITM.FEATHER)>=1&&_total(g)===2, out:{id:ITM.ARROW,count:4},
   consume:g=>{_consumeN(g,ITM.STICK,1);_consumeN(g,ITM.FEATHER,1);}},
  /* 弓 (3x3) */
  {match:g=>g.length===9&&_match3(g,['.SA','SSA','.SA'],{S:ITM.STICK,A:ITM.STRING}), out:{id:ITM.BOW,count:1},
   consume:g=>_consume3(g,['.SA','SSA','.SA'],{S:ITM.STICK,A:ITM.STRING})},
  /* ガラス: 砂+石炭 shapeless */
  {match:g=>_cnt(g,BLK.SAND)>=1&&_cnt(g,ITM.COAL)>=1&&_total(g)===2, out:{id:BLK.GLASS,count:3},
   consume:g=>{_consumeN(g,BLK.SAND,1);_consumeN(g,ITM.COAL,1);}},
  /* 鉄インゴット: 鉄鉱石+石炭 shapeless (かまどなしの簡易製錬) */
  {match:g=>_cnt(g,BLK.IRON_ORE)>=1&&_cnt(g,ITM.COAL)>=1&&_total(g)===2, out:{id:ITM.IRON_ING,count:1},
   consume:g=>{_consumeN(g,BLK.IRON_ORE,1);_consumeN(g,ITM.COAL,1);}},
  /* 金インゴット: 金鉱石+石炭 */
  {match:g=>_cnt(g,BLK.GOLD_ORE)>=1&&_cnt(g,ITM.COAL)>=1&&_total(g)===2, out:{id:ITM.GOLD_ING,count:1},
   consume:g=>{_consumeN(g,BLK.GOLD_ORE,1);_consumeN(g,ITM.COAL,1);}},
];

function calcCraftResult(grid){
  for(const r of RECIPES){if(r.match(grid))return{...r.out};}
  return{id:0,count:0};
}
function doCraft(grid,outSlot){
  if(!outSlot.id)return;
  INV.addItem(outSlot.id,outSlot.count);
  for(const r of RECIPES){if(r.match(grid)){r.consume(grid);break;}}
  const res=calcCraftResult(grid);
  outSlot.id=res.id;outSlot.count=res.count;
}
function returnCraftGrid(grid){
  grid.forEach(s=>{if(s.id){INV.addItem(s.id,s.count);s.id=0;s.count=0;}});
}
