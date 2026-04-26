'use strict';
const BDATA={
  [BLK.GRASS]:      {name:'草ブロック',  top:[.34,.56,.18],side:[.35,.25,.13],bot:[.35,.25,.13],hard:.9, trans:false,solid:true, drop:BLK.DIRT},
  [BLK.DIRT]:       {name:'土',          top:[.38,.27,.14],side:[.38,.27,.14],bot:[.38,.27,.14],hard:.5, trans:false,solid:true, drop:BLK.DIRT},
  [BLK.STONE]:      {name:'石',          top:[.47,.47,.47],side:[.47,.47,.47],bot:[.47,.47,.47],hard:3.0,trans:false,solid:true, drop:BLK.COBBLE},
  [BLK.SAND]:       {name:'砂',          top:[.87,.82,.58],side:[.87,.82,.58],bot:[.87,.82,.58],hard:.6, trans:false,solid:true, drop:BLK.SAND},
  [BLK.GRAVEL]:     {name:'砂利',        top:[.56,.54,.50],side:[.56,.54,.50],bot:[.56,.54,.50],hard:.6, trans:false,solid:true, drop:BLK.GRAVEL},
  [BLK.OAK_LOG]:    {name:'オーク原木',  top:[.62,.52,.30],side:[.38,.27,.13],bot:[.62,.52,.30],hard:2.0,trans:false,solid:true, drop:BLK.OAK_LOG},
  [BLK.OAK_PLANKS]: {name:'オーク板材',  top:[.74,.60,.38],side:[.74,.60,.38],bot:[.74,.60,.38],hard:2.0,trans:false,solid:true, drop:BLK.OAK_PLANKS},
  [BLK.OAK_LEAVES]: {name:'オークの葉',  top:[.24,.47,.13],side:[.24,.47,.13],bot:[.24,.47,.13],hard:.2, trans:true, solid:false,drop:0},
  [BLK.GLASS]:      {name:'ガラス',      top:[.76,.91,1.0],side:[.76,.91,1.0],bot:[.76,.91,1.0],hard:.5, trans:true, solid:true, drop:0},
  [BLK.COBBLE]:     {name:'丸石',        top:[.44,.43,.41],side:[.44,.43,.41],bot:[.44,.43,.41],hard:3.0,trans:false,solid:true, drop:BLK.COBBLE},
  [BLK.BRICK]:      {name:'レンガ',      top:[.67,.33,.25],side:[.67,.33,.25],bot:[.67,.33,.25],hard:3.5,trans:false,solid:true, drop:BLK.BRICK},
  [BLK.IRON_ORE]:   {name:'鉄鉱石',     top:[.56,.53,.49],side:[.56,.53,.49],bot:[.56,.53,.49],hard:4.0,trans:false,solid:true, drop:ITM.IRON_ING},
  [BLK.COAL_ORE]:   {name:'石炭鉱石',   top:[.31,.31,.31],side:[.31,.31,.31],bot:[.31,.31,.31],hard:4.0,trans:false,solid:true, drop:ITM.COAL},
  [BLK.DIAMOND_ORE]:{name:'ダイヤ鉱石', top:[.22,.67,.77],side:[.22,.67,.77],bot:[.22,.67,.77],hard:5.0,trans:false,solid:true, drop:ITM.DIAMOND},
  [BLK.OBSIDIAN]:   {name:'黒曜石',     top:[.12,.09,.19],side:[.12,.09,.19],bot:[.12,.09,.19],hard:50, trans:false,solid:true, drop:BLK.OBSIDIAN},
  [BLK.SNOW]:       {name:'雪',          top:[.93,.96,.99],side:[.93,.96,.99],bot:[.93,.96,.99],hard:.4, trans:false,solid:true, drop:BLK.SNOW},
  [BLK.ICE]:        {name:'氷',          top:[.68,.84,.97],side:[.68,.84,.97],bot:[.68,.84,.97],hard:.7, trans:true, solid:true, drop:0},
  [BLK.BEDROCK]:    {name:'岩盤',        top:[.20,.19,.18],side:[.20,.19,.18],bot:[.20,.19,.18],hard:Infinity,trans:false,solid:true,drop:0},
  [BLK.GOLD_ORE]:   {name:'金鉱石',     top:[.84,.74,.24],side:[.84,.74,.24],bot:[.84,.74,.24],hard:4.5,trans:false,solid:true, drop:ITM.GOLD_ING},
  [BLK.CRAFT_TABLE]:{name:'作業台',     top:[.56,.40,.22],side:[.62,.44,.26],bot:[.74,.60,.38],hard:2.0,trans:false,solid:true, drop:BLK.CRAFT_TABLE}
};
function bFaceColor(id,dir){const d=BDATA[id];if(!d)return[.5,.5,.5];if(dir[1]>0)return d.top;if(dir[1]<0)return d.bot;return d.side}
function isSolid(id){if(!id||id===BLK.AIR)return false;const d=BDATA[id];return d?d.solid:false}
function isTrans(id){if(!id||id===BLK.AIR)return true;const d=BDATA[id];return d?d.trans:false}
function hardness(id){const d=BDATA[id];return d?d.hard:1}
function bName(id){const d=BDATA[id];return d?d.name:'不明'}
function bDrop(id){const d=BDATA[id];return d?d.drop:0}
