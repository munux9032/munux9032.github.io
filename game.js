'use strict';
let lastTime=0;
function setLD(pct,msg){
  document.getElementById('ld-fill').style.width=pct+'%';
  document.getElementById('ld-msg').textContent=msg;
}
function tick(){return new Promise(r=>setTimeout(r,16));}

async function init(){
  if(typeof THREE==='undefined'){
    document.getElementById('ld-msg').textContent='Error: Three.js not loaded';return;
  }
  setLD(10,'レンダラー初期化...');await tick();
  setupRenderer();
  setLD(25,'ワールド生成中...');await tick();
  generateWorld();
  setLD(55,'プレイヤー設定...');await tick();
  initPlayer();initInventory();
  setLD(68,'チャンクメッシュ構築中...');await tick();
  buildAllChunks();
  setLD(85,'コントロール初期化...');await tick();
  setupControls();
  setLD(93,'UI初期化...');await tick();
  initUI();
  injectButtonArt();
  setLD(100,'準備完了!');
  await new Promise(r=>setTimeout(r,500));
  document.getElementById('ld').style.display='none';
  document.getElementById('G').style.display='block';
  lastTime=performance.now();
  requestAnimationFrame(loop);
}

function loop(now){
  const dt=Math.min((now-lastTime)/1000,.05);
  lastTime=now;
  updateKBMove();
  if(!invOpen&&!tableOpen)updatePlayer(dt);
  setHighlight(getTarget());
  tickUI();
  renderFrame();
  requestAnimationFrame(loop);
}

window.addEventListener('load',()=>{
  init().catch(err=>{
    console.error(err);
    document.getElementById('ld-msg').textContent='エラー: '+err.message;
  });
});
