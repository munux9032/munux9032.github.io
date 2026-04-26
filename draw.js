'use strict';
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    r=Math.min(r||0,w/2,h/2);
    this.beginPath();this.moveTo(x+r,y);
    this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);
    this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);
    this.closePath();return this;
  };
}
function rgb(c,br){return'rgb('+((c[0]*255*br)|0)+','+((c[1]*255*br)|0)+','+((c[2]*255*br)|0)+')';}
function drawBlock(ctx,id,x,y,s){
  const d=BDATA[id];if(!d)return;
  const h=s*.5,q=s*.25;
  ctx.fillStyle=rgb(d.top,1.0);
  ctx.beginPath();ctx.moveTo(x+h,y+q*.6);ctx.lineTo(x+s-1,y+h-q*.4);ctx.lineTo(x+h,y+h+q*.2);ctx.lineTo(x+1,y+h-q*.4);ctx.closePath();ctx.fill();
  ctx.fillStyle=rgb(d.side,.68);
  ctx.beginPath();ctx.moveTo(x+1,y+h-q*.4);ctx.lineTo(x+h,y+h+q*.2);ctx.lineTo(x+h,y+s-2);ctx.lineTo(x+1,y+h+q*1.2);ctx.closePath();ctx.fill();
  ctx.fillStyle=rgb(d.side,.85);
  ctx.beginPath();ctx.moveTo(x+h,y+h+q*.2);ctx.lineTo(x+s-1,y+h-q*.4);ctx.lineTo(x+s-1,y+h+q*1.2);ctx.lineTo(x+h,y+s-2);ctx.closePath();ctx.fill();
}
function drawItem(ctx,id,x,y,s){
  const d=IDATA[id];if(!d)return;
  const c1=d.c1,c2=d.c2;
  ctx.save();ctx.translate(x,y);
  switch(d.type){
    case'sword':
      ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(s*.38,s*.1);ctx.lineTo(s*.54,s*.1);ctx.lineTo(s*.48,s*.72);ctx.closePath();ctx.fill();
      ctx.fillStyle=c1;ctx.fillRect(s*.38,s*.08,s*.16,s*.5);
      ctx.fillStyle=c2;ctx.fillRect(s*.28,s*.08,s*.36,s*.08);break;
    case'bow':
      ctx.strokeStyle=c1;ctx.lineWidth=s*.1;ctx.beginPath();ctx.arc(s*.4,s*.5,s*.35,-Math.PI*.7,Math.PI*.7);ctx.stroke();
      ctx.strokeStyle=c2;ctx.lineWidth=s*.05;ctx.beginPath();ctx.moveTo(s*.55,s*.18);ctx.lineTo(s*.62,s*.5);ctx.lineTo(s*.55,s*.82);ctx.stroke();break;
    case'pick':
      ctx.fillStyle=c2;ctx.fillRect(s*.12,s*.35,s*.76,s*.18);
      ctx.fillStyle=c1;ctx.fillRect(s*.12,s*.16,s*.68,s*.22);ctx.fillRect(s*.12,s*.16,s*.18,s*.38);ctx.fillRect(s*.62,s*.16,s*.18,s*.38);break;
    case'axe':
      ctx.fillStyle=c2;ctx.fillRect(s*.44,s*.28,s*.14,s*.64);ctx.fillStyle=c1;ctx.fillRect(s*.16,s*.14,s*.44,s*.44);break;
    case'shovel':
      ctx.fillStyle=c2;ctx.fillRect(s*.44,s*.3,s*.14,s*.62);ctx.fillStyle=c1;ctx.fillRect(s*.28,s*.14,s*.36,s*.22);break;
    case'rod':
      ctx.strokeStyle=c1;ctx.lineWidth=s*.09;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(s*.72,s*.14);ctx.lineTo(s*.24,s*.86);ctx.stroke();
      ctx.strokeStyle=c2;ctx.lineWidth=s*.04;ctx.beginPath();ctx.moveTo(s*.72,s*.14);ctx.quadraticCurveTo(s*.9,s*.3,s*.76,s*.72);ctx.stroke();break;
    case'apple':
      ctx.fillStyle=c1;ctx.beginPath();ctx.arc(s*.5,s*.56,s*.36,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.arc(s*.38,s*.44,s*.12,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=c2;ctx.fillRect(s*.46,s*.15,s*.08,s*.18);
      ctx.fillStyle='#2a6';ctx.beginPath();ctx.ellipse(s*.62,s*.22,s*.14,s*.08,.4,0,Math.PI*2);ctx.fill();break;
    case'bread':
      ctx.fillStyle=c1;ctx.roundRect(s*.12,s*.28,s*.76,s*.44,s*.08);ctx.fill();
      ctx.fillStyle=c2;ctx.roundRect(s*.12,s*.28,s*.76,s*.18,s*.08);ctx.fill();break;
    case'coal':
      ctx.fillStyle=c1;ctx.roundRect(s*.18,s*.18,s*.64,s*.64,s*.06);ctx.fill();
      ctx.fillStyle=c2;ctx.fillRect(s*.28,s*.28,s*.18,s*.18);ctx.fillRect(s*.54,s*.36,s*.14,s*.22);break;
    case'ingot':
      ctx.fillStyle=c1;ctx.roundRect(s*.14,s*.28,s*.72,s*.44,s*.06);ctx.fill();
      ctx.fillStyle=c2;ctx.fillRect(s*.22,s*.36,s*.56,s*.12);break;
    case'gem':
      ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(s*.5,s*.12);ctx.lineTo(s*.84,s*.44);ctx.lineTo(s*.5,s*.88);ctx.lineTo(s*.16,s*.44);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.moveTo(s*.5,s*.12);ctx.lineTo(s*.7,s*.32);ctx.lineTo(s*.5,s*.44);ctx.lineTo(s*.3,s*.32);ctx.closePath();ctx.fill();break;
    case'stick':
      ctx.strokeStyle=c1;ctx.lineWidth=s*.14;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(s*.26,s*.74);ctx.lineTo(s*.74,s*.26);ctx.stroke();break;
    case'torch':
      ctx.fillStyle=c2;ctx.fillRect(s*.44,s*.28,s*.12,s*.58);
      ctx.fillStyle=c1;ctx.beginPath();ctx.arc(s*.5,s*.26,s*.14,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ff9';ctx.beginPath();ctx.arc(s*.5,s*.24,s*.07,0,Math.PI*2);ctx.fill();break;
    case'book':
      ctx.fillStyle=c1;ctx.roundRect(s*.18,s*.14,s*.64,s*.72,s*.06);ctx.fill();
      ctx.fillStyle=c2;ctx.fillRect(s*.28,s*.22,s*.44,s*.56);
      ctx.fillStyle='rgba(255,255,255,.4)';for(let i=0;i<3;i++)ctx.fillRect(s*.34,s*(.3+i*.14),s*.32,s*.05);break;
    case'map':
      ctx.fillStyle=c2;ctx.roundRect(s*.1,s*.1,s*.8,s*.8,s*.04);ctx.fill();
      ctx.fillStyle=c1;ctx.fillRect(s*.18,s*.18,s*.64,s*.64);
      ctx.fillStyle='#5a8';ctx.fillRect(s*.22,s*.22,s*.24,s*.2);
      ctx.fillStyle='#888';ctx.fillRect(s*.5,s*.28,s*.28,s*.28);break;
    case'arrow':
      ctx.strokeStyle=c1;ctx.lineWidth=s*.08;ctx.beginPath();ctx.moveTo(s*.72,s*.18);ctx.lineTo(s*.28,s*.82);ctx.stroke();
      ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(s*.72,s*.18);ctx.lineTo(s*.58,s*.32);ctx.lineTo(s*.62,s*.24);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(s*.28,s*.82);ctx.lineTo(s*.18,s*.72);ctx.lineTo(s*.36,s*.78);ctx.closePath();ctx.fill();break;
    case'bone':
      ctx.strokeStyle=c1;ctx.lineWidth=s*.12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(s*.28,s*.72);ctx.lineTo(s*.72,s*.28);ctx.stroke();
      ctx.fillStyle=c1;
      [[s*.22,s*.78,s*.1],[s*.34,s*.66,s*.08],[s*.78,s*.22,s*.1],[s*.66,s*.34,s*.08]].forEach(([bx,by,r])=>{ctx.beginPath();ctx.arc(bx,by,r,0,Math.PI*2);ctx.fill();});break;
    case'feather':
      ctx.strokeStyle=c1;ctx.lineWidth=s*.06;ctx.beginPath();ctx.moveTo(s*.28,s*.72);ctx.quadraticCurveTo(s*.5,s*.3,s*.78,s*.18);ctx.stroke();
      ctx.fillStyle=c2;
      for(let i=0;i<5;i++){const t=i/4,bx=s*(.28+t*.38),by=s*(.72-t*.44);ctx.save();ctx.translate(bx,by);ctx.rotate(-Math.PI*.25);ctx.beginPath();ctx.ellipse(0,0,s*.05,s*.11,0,0,Math.PI*2);ctx.fill();ctx.restore();}break;
    case'string':
      ctx.strokeStyle=c1;ctx.lineWidth=s*.05;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(s*(.28+i*.12),s*.2);ctx.lineTo(s*(.38+i*.12),s*.8);ctx.stroke();}break;
    default:
      ctx.fillStyle=c1;ctx.roundRect(s*.18,s*.18,s*.64,s*.64,s*.1);ctx.fill();
  }
  ctx.restore();
}
function makeIconCanvas(id,size){
  size=size||34;
  const c=document.createElement('canvas');
  c.width=size;c.height=size;c.style.width=size+'px';c.style.height=size+'px';c.style.imageRendering='pixelated';
  if(!id||id===0)return c;
  const ctx=c.getContext('2d');
  if(id>=1&&id<=20)drawBlock(ctx,id,0,0,size);
  else drawItem(ctx,id,0,0,size);
  return c;
}