'use strict';
const CHUNK_W=16,CHUNK_H=32,CHUNK_D=16;
const WORLD_CX=4,WORLD_CZ=4;
const WORLD_W=CHUNK_W*WORLD_CX,WORLD_H=CHUNK_H,WORLD_D=CHUNK_D*WORLD_CZ;
const PLAYER_HEIGHT=1.8,PLAYER_EYE=1.62,PLAYER_W=0.6;
const SPD_WALK=4.8,SPD_SPRINT=7.5,SPD_SNEAK=2.0;
const JUMP_V=8.0,GRAVITY=-24.0,TERM_V=-55.0,REACH=5.0;
const BLK=Object.freeze({AIR:0,GRASS:1,DIRT:2,STONE:3,SAND:4,GRAVEL:5,OAK_LOG:6,OAK_PLANKS:7,OAK_LEAVES:8,GLASS:9,COBBLE:10,BRICK:11,IRON_ORE:12,COAL_ORE:13,DIAMOND_ORE:14,OBSIDIAN:15,SNOW:16,ICE:17,BEDROCK:18,GOLD_ORE:19,CRAFT_TABLE:20});
const ITM=Object.freeze({WOOD_SWORD:101,STONE_PICK:102,IRON_AXE:103,WOOD_SHOVEL:104,BOW:105,ARROW:106,APPLE:107,BREAD:108,COAL:109,IRON_ING:110,DIAMOND:111,GOLD_ING:112,STICK:113,TORCH:114,BOOK:115,MAP:116,FISH_ROD:117,BONE:118,FEATHER:119,STRING:120});

/* FACES: インデックスバッファで sv,sv+1,sv+2 と sv+2,sv+1,sv+3 の2三角形を形成。
   各面で (corners[1]-corners[0]) × (corners[2]-corners[0]) = dir になるよう
   ワインディング順序を正確に設定（Three.js CCW front face 準拠）。
   検証済み:
     -X: (0,1,0)×(0,0,-1)=(-1,0,0) ✓  +X: (0,1,0)×(0,0,1)=(1,0,0) ✓
     -Y: (0,0,-1)×(1,0,0)=(0,-1,0) ✓  +Y: (0,0,1)×(1,0,0)=(0,1,0) ✓
     -Z: (-1,0,0)×(0,1,0)=(0,0,-1) ✓  +Z: (1,0,0)×(0,1,0)=(0,0,1) ✓  */
const FACES=Object.freeze([
  {dir:[-1,0,0],bright:.75,corners:[{p:[0,0,1]},{p:[0,1,1]},{p:[0,0,0]},{p:[0,1,0]}]},
  {dir:[1,0,0], bright:.75,corners:[{p:[1,0,0]},{p:[1,1,0]},{p:[1,0,1]},{p:[1,1,1]}]},
  {dir:[0,-1,0],bright:.50,corners:[{p:[0,0,1]},{p:[0,0,0]},{p:[1,0,1]},{p:[1,0,0]}]},
  {dir:[0,1,0], bright:1.0,corners:[{p:[0,1,0]},{p:[0,1,1]},{p:[1,1,0]},{p:[1,1,1]}]},
  {dir:[0,0,-1],bright:.85,corners:[{p:[1,0,0]},{p:[0,0,0]},{p:[1,1,0]},{p:[0,1,0]}]},
  {dir:[0,0,1], bright:.85,corners:[{p:[0,0,1]},{p:[1,0,1]},{p:[0,1,1]},{p:[1,1,1]}]}
]);

/* raycast face名 → 設置先オフセット */
const FOFF=Object.freeze({west:[-1,0,0],east:[1,0,0],down:[0,-1,0],up:[0,1,0],north:[0,0,-1],south:[0,0,1]});
function lerp(a,b,t){return a+(b-a)*t}
function clamp(v,lo,hi){return v<lo?lo:v>hi?hi:v}
function smoothstep(t){return t*t*(3-2*t)}
