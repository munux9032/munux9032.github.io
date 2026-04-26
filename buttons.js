'use strict';
// ピクセルドットアートボタン描画
// 各ボタンはCanvas 2Dで描画。P=pixel size

function px(ctx, grid, P, color) {
  ctx.fillStyle = color;
  grid.forEach(([c, r]) => ctx.fillRect(c*P, r*P, P, P));
}

// ── しゃがむ（Sneak）──  人が膝を曲げている形
function drawSneak(ctx, S) {
  const P = S / 10;
  const bg = '#1a1a2e', head = '#f5c89a', body = '#3a7bd5', leg = '#1a3a6e', shoe = '#111';
  ctx.fillStyle = bg; ctx.fillRect(0,0,S,S);
  // 頭
  px(ctx,[[4,1],[5,1],[4,2],[5,2]],P,head);
  // 体（前傾）
  px(ctx,[[3,3],[4,3],[5,3],[3,4],[4,4]],P,body);
  // 腕（前に出す）
  px(ctx,[[6,3],[7,3]],P,body);
  // 曲げた足
  px(ctx,[[3,5],[4,5]],P,leg);
  px(ctx,[[4,6],[5,6]],P,leg);
  // 靴
  px(ctx,[[3,6],[5,7],[6,7]],P,shoe);
}

// ── ダッシュ（Sprint）── 前傾み走り
function drawSprint(ctx, S) {
  const P = S / 10;
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,S,S);
  const head='#f5c89a', body='#e05c2a', leg='#2a2a6e', shoe='#111', arm='#e05c2a';
  // 頭（前傾）
  px(ctx,[[5,1],[6,1],[5,2],[6,2]],P,head);
  // 体（斜め）
  px(ctx,[[4,3],[5,3],[4,4]],P,body);
  // 腕（後ろ）
  px(ctx,[[3,3],[2,4]],P,arm);
  // 腕（前）
  px(ctx,[[5,4],[6,5]],P,arm);
  // 足（ストライド）
  px(ctx,[[3,5],[3,6]],P,leg);
  px(ctx,[[5,5],[6,6]],P,leg);
  // 靴
  px(ctx,[[2,7],[3,7]],P,shoe);
  px(ctx,[[6,7],[7,7]],P,shoe);
  // 速度線
  px(ctx,[[1,3],[1,5],[1,7]],P,'rgba(255,255,255,0.3)');
}

// ── インベントリ（Bag）──  リュックサック
function drawInventory(ctx, S) {
  const P = S / 10;
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,S,S);
  const bag='#8B4513', strap='#6B3410', clasp='#ffd700', pocket='#7a3c10';
  // ストラップ
  px(ctx,[[3,2],[4,2],[6,2],[7,2]],P,strap);
  px(ctx,[[3,3],[7,3]],P,strap);
  // メインバッグ
  for(let r=4;r<=8;r++) for(let c=2;c<=8;c++) px(ctx,[[c,r]],P,bag);
  // ポケット
  for(let r=5;r<=7;r++) for(let c=3;c<=7;c++) px(ctx,[[c,r]],P,pocket);
  // 留め具
  px(ctx,[[4,4],[5,4],[6,4]],P,clasp);
  // ポケット線
  px(ctx,[[3,5],[7,5]],P,'#5a2c08');
}

// ── 副手交換（Swap）── 2本の矢印が入れ替わり
function drawSwap(ctx, S) {
  const P = S / 10;
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,S,S);
  const c1='#4fc3f7', c2='#ff8a65', arr='#ffffff';
  // 左アイテム（四角）
  px(ctx,[[1,3],[2,3],[1,4],[2,4]],P,c1);
  // 右アイテム（四角）
  px(ctx,[[7,6],[8,6],[7,7],[8,7]],P,c2);
  // 上向き矢印（右行き）
  px(ctx,[[3,2],[4,2],[5,2],[6,2],[7,2]],P,arr);
  px(ctx,[[6,1],[7,1]],P,arr); // 矢じり上
  px(ctx,[[6,3],[7,3]],P,arr); // 矢じり下
  // 下向き矢印（左行き）
  px(ctx,[[2,7],[3,7],[4,7],[5,7],[6,7]],P,arr);
  px(ctx,[[2,6],[3,6]],P,arr); // 矢じり上
  px(ctx,[[2,8],[3,8]],P,arr); // 矢じり下
}

// ── ブレーク（Pickaxe）── つるはし
function drawBreak(ctx, S) {
  const P = S / 10;
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,S,S);
  const metal='#b0bec5', dark='#607d8b', handle='#8d6e63', tip='#eceff1';
  // 柄（斜め）
  px(ctx,[[2,8],[3,7],[4,6],[5,5]],P,handle);
  // ヘッド横バー
  px(ctx,[[3,3],[4,3],[5,3],[6,3],[7,3]],P,metal);
  // 左先端（鋭い）
  px(ctx,[[2,4],[3,4]],P,tip);
  px(ctx,[[2,3],[2,2]],P,tip);
  // 右先端
  px(ctx,[[7,4],[7,5]],P,dark);
  px(ctx,[[8,3],[8,2]],P,tip);
  // ヘッド補強
  px(ctx,[[4,4],[5,4]],P,dark);
  // 先端光沢
  px(ctx,[[2,2],[8,2]],P,'rgba(255,255,255,0.5)');
}

// ── ジャンプ（Jump）── 上矢印＋人
function drawJump(ctx, S) {
  const P = S / 10;
  ctx.fillStyle = '#0a2a0a'; ctx.fillRect(0,0,S,S);
  const head='#f5c89a', body='#4caf50', arr='#8bc34a', shine='#ffffff';
  // 大きい上向き三角矢印
  px(ctx,[[5,1]],P,arr);
  px(ctx,[[4,2],[5,2],[6,2]],P,arr);
  px(ctx,[[3,3],[4,3],[5,3],[6,3],[7,3]],P,arr);
  // 矢印の軸
  px(ctx,[[4,4],[5,4],[6,4]],P,arr);
  px(ctx,[[4,5],[5,5],[6,5]],P,arr);
  // 人（ジャンプ中）
  px(ctx,[[5,5],[5,6]],P,head); // 頭小
  px(ctx,[[4,7],[5,7],[6,7]],P,body); // 体
  px(ctx,[[3,8],[4,8]],P,body); // 左腕上
  px(ctx,[[6,8],[7,8]],P,body); // 右腕上
  px(ctx,[[4,9],[6,9]],P,body); // 脚
  // 輝き
  px(ctx,[[5,1]],P,shine);
}

// ── ブロック設置（Place）── 手がブロックを置く
function drawPlace(ctx, S) {
  const P = S / 10;
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,S,S);
  const blk='#5c8a3c', blkD='#3d6128', blkT='#7ab54e', hand='#f5c89a', hanD='#d4a070';
  // ブロック上面
  px(ctx,[[2,5],[3,5],[4,5],[5,5],[6,5]],P,blkT);
  px(ctx,[[1,6],[2,6],[3,6]],P,blkT);
  // ブロック左面
  for(let r=6;r<=9;r++) px(ctx,[[1,r],[2,r],[3,r],[4,r],[5,r]],P,blk);
  // ブロック右面
  for(let r=6;r<=9;r++) px(ctx,[[5,r],[6,r],[7,r],[8,r]],P,blkD);
  // 手（右上から置く動き）
  px(ctx,[[6,1],[7,1],[8,1]],P,hand);
  px(ctx,[[7,2],[8,2]],P,hand);
  px(ctx,[[7,3],[8,3]],P,hanD);
  // 矢印（下向き）
  px(ctx,[[5,2],[5,3],[5,4]],P,'rgba(255,255,100,0.8)');
  px(ctx,[[4,4],[6,4]],P,'rgba(255,255,100,0.8)');
}

// ── 全ボタンキャンバス生成 ──
function makeButtonCanvas(type, size) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  c.style.width = size+'px'; c.style.height = size+'px';
  c.style.imageRendering = 'pixelated';
  c.style.pointerEvents = 'none';
  const ctx = c.getContext('2d');
  switch(type) {
    case 'sneak':     drawSneak(ctx, size);     break;
    case 'sprint':    drawSprint(ctx, size);    break;
    case 'inventory': drawInventory(ctx, size); break;
    case 'swap':      drawSwap(ctx, size);      break;
    case 'break':     drawBreak(ctx, size);     break;
    case 'jump':      drawJump(ctx, size);      break;
    case 'place':     drawPlace(ctx, size);     break;
  }
  return c;
}

// ── ボタン要素にキャンバスを注入 ──
function injectButtonArt() {
  const map = {
    'bsneak':'sneak','bsprint':'sprint','binv':'inventory',
    'bswap':'swap','bbrk':'break','bjmp':'jump','bplc':'place'
  };
  Object.entries(map).forEach(([id, type]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = '';
    const sz = (id === 'bjmp') ? 44 : 34;
    el.appendChild(makeButtonCanvas(type, sz));
  });
}
