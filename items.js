'use strict';
const IDATA={
  [ITM.WOOD_SWORD]: {name:'木の剣',       type:'sword',  stack:false,max:1, c1:'#c8a050',c2:'#ddd'},
  [ITM.STONE_PICK]: {name:'石のつるはし', type:'pick',   stack:false,max:1, c1:'#888',   c2:'#963'},
  [ITM.IRON_AXE]:   {name:'鉄の斧',       type:'axe',    stack:false,max:1, c1:'#ccc',   c2:'#963'},
  [ITM.WOOD_SHOVEL]:{name:'木のシャベル', type:'shovel', stack:false,max:1, c1:'#c8a050',c2:'#963'},
  [ITM.BOW]:        {name:'弓',            type:'bow',    stack:false,max:1, c1:'#8B4513',c2:'#ccc'},
  [ITM.ARROW]:      {name:'矢',            type:'arrow',  stack:true, max:64,c1:'#888',   c2:'#c85'},
  [ITM.APPLE]:      {name:'リンゴ',        type:'apple',  stack:true, max:64,c1:'#d43022',c2:'#2a5'},
  [ITM.BREAD]:      {name:'パン',          type:'bread',  stack:true, max:64,c1:'#c8914a',c2:'#a06028'},
  [ITM.COAL]:       {name:'石炭',          type:'coal',   stack:true, max:64,c1:'#1a1a1a',c2:'#444'},
  [ITM.IRON_ING]:   {name:'鉄インゴット',  type:'ingot',  stack:true, max:64,c1:'#c0bdb8',c2:'#888'},
  [ITM.DIAMOND]:    {name:'ダイヤモンド',  type:'gem',    stack:true, max:64,c1:'#3be0ff',c2:'#0af'},
  [ITM.GOLD_ING]:   {name:'金インゴット',  type:'ingot',  stack:true, max:64,c1:'#ffd700',c2:'#c8a020'},
  [ITM.STICK]:      {name:'棒',            type:'stick',  stack:true, max:64,c1:'#8B6038',c2:'#a07040'},
  [ITM.TORCH]:      {name:'たいまつ',      type:'torch',  stack:true, max:64,c1:'#ff6600',c2:'#ffcc00'},
  [ITM.BOOK]:       {name:'本',            type:'book',   stack:true, max:64,c1:'#a03030',c2:'#e0c090'},
  [ITM.MAP]:        {name:'地図',          type:'map',    stack:false,max:1, c1:'#f0a060',c2:'#c07030'},
  [ITM.FISH_ROD]:   {name:'釣り竿',        type:'rod',    stack:false,max:1, c1:'#8B6038',c2:'#4aa'},
  [ITM.BONE]:       {name:'骨',            type:'bone',   stack:true, max:64,c1:'#e8e4d8',c2:'#ccc8b8'},
  [ITM.FEATHER]:    {name:'羽根',          type:'feather',stack:true, max:64,c1:'#f0f0f0',c2:'#b0b0b0'},
  [ITM.STRING]:     {name:'糸',            type:'string', stack:true, max:64,c1:'#e0e0e0',c2:'#c0c0c0'}
};
function iStackable(id){if(id>=1&&id<=20)return true;const d=IDATA[id];return d?d.stack:false}
function iMaxStack(id){if(id>=1&&id<=20)return 64;const d=IDATA[id];return d?d.max:1}
