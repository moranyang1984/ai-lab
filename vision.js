/* Vision — small, real image computations run in the browser:
   grayscale, convolution feature maps, colour maps, pixel readout, block-matching optical flow. */
(function(){
const V={};
V.gray=(ctx,w,h)=>{const d=ctx.getImageData(0,0,w,h).data,g=new Float32Array(w*h);for(let i=0;i<w*h;i++)g[i]=(0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2])/255;return g;};
V.conv=(g,w,h,k,ks)=>{const o=new Float32Array(w*h),r=ks>>1;for(let y=r;y<h-r;y++)for(let x=r;x<w-r;x++){let s=0;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)s+=g[(y+j)*w+x+i]*k[(j+r)*ks+i+r];o[y*w+x]=s;}return o;};
V.relu=a=>{for(let i=0;i<a.length;i++)if(a[i]<0)a[i]=0;return a;};
V.abs=a=>{for(let i=0;i<a.length;i++)a[i]=Math.abs(a[i]);return a;};
V.pool=(a,w,h,f)=>{const W=Math.floor(w/f),H=Math.floor(h/f),o=new Float32Array(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){let m=0;for(let j=0;j<f;j++)for(let i=0;i<f;i++){const v=a[(y*f+j)*w+x*f+i];if(v>m)m=v;}o[y*W+x]=m;}return {a:o,w:W,h:H};};
V.blur=(a,w,h,r)=>{const k=[];let s=0;for(let i=-r;i<=r;i++){const v=Math.exp(-i*i/(2*(r/2)*(r/2)));k.push(v);s+=v;}k.forEach((v,i)=>k[i]=v/s);const t=new Float32Array(w*h),o=new Float32Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=0;for(let i=-r;i<=r;i++){const xx=Math.min(w-1,Math.max(0,x+i));v+=a[y*w+xx]*k[i+r];}t[y*w+x]=v;}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=0;for(let i=-r;i<=r;i++){const yy=Math.min(h-1,Math.max(0,y+i));v+=t[yy*w+x]*k[i+r];}o[y*w+x]=v;}return o;};
// inferno-like colour ramp
const RAMP=[[0,0,4],[40,11,84],[101,21,110],[159,42,99],[212,72,66],[245,125,21],[250,193,39],[252,255,164]];
V.color=v=>{v=Math.max(0,Math.min(1,v))*(RAMP.length-1);const i=Math.floor(v),f=v-i,a=RAMP[i],b=RAMP[Math.min(RAMP.length-1,i+1)];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];};
V.paint=(cv,a,w,h)=>{cv.width=w;cv.height=h;const ctx=cv.getContext('2d'),im=ctx.createImageData(w,h);const s=[...a].sort((p,q)=>p-q);const lo=s[Math.floor(s.length*.01)],hi=s[Math.floor(s.length*.995)]||1;
  for(let i=0;i<w*h;i++){const c=V.color(Math.pow(Math.max(0,(a[i]-lo)/(hi-lo+1e-9)),0.65));im.data[i*4]=c[0];im.data[i*4+1]=c[1];im.data[i*4+2]=c[2];im.data[i*4+3]=255;}ctx.putImageData(im,0,0);};
const K={sx:[-1,0,1,-2,0,2,-1,0,1],sy:[-1,-2,-1,0,0,0,1,2,1],d1:[0,1,2,-1,0,1,-2,-1,0],d2:[-2,-1,0,-1,0,1,0,1,2]};
function gabor(theta,lam){const ks=7,k=[],r=3;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const xr=x*Math.cos(theta)+y*Math.sin(theta),yr=-x*Math.sin(theta)+y*Math.cos(theta);k.push(Math.exp(-(xr*xr+yr*yr)/(2*2.2*2.2))*Math.cos(2*Math.PI*xr/lam));}const m=k.reduce((a,b)=>a+b,0)/k.length;return k.map(v=>v-m);}
/* three "layers" of feature maps from an image element */
V.featureMaps=function(src,W=192,H=128){const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');ctx.drawImage(src,0,0,W,H);const g=V.gray(ctx,W,H);
  const L1=[K.sx,K.sy,K.d1,K.d2].map(k=>V.relu(V.conv(g,W,H,k,3)));
  const L2=[0,Math.PI/2,Math.PI/4,3*Math.PI/4].map(t=>{const a=V.abs(V.conv(g,W,H,gabor(t,4),7));return V.blur(a,W,H,2);});
  const mag=new Float32Array(W*H);L1.forEach(a=>{for(let i=0;i<a.length;i++)mag[i]+=a[i];});
  const tex=new Float32Array(W*H);L2.forEach(a=>{for(let i=0;i<a.length;i++)tex[i]+=a[i];});
  const dark=new Float32Array(W*H);for(let i=0;i<W*H;i++)dark[i]=1-g[i];
  const L3=[V.blur(mag,W,H,6),V.blur(tex,W,H,8),V.blur(dark.map((v,i)=>v*mag[i]),W,H,7),V.blur(tex.map((v,i)=>v*mag[i]),W,H,10)];
  return {W,H,layers:[L1,L2,L3]};};
/* pixel readout around (x,y) in a canvas (canvas pixel coords) */
V.pixels=(cv,x,y,n=12)=>{const ctx=cv.getContext('2d');const x0=Math.max(0,Math.min(cv.width-n,Math.round(x-n/2))),y0=Math.max(0,Math.min(cv.height-n,Math.round(y-n/2)));return {x0,y0,n,data:ctx.getImageData(x0,y0,n,n).data};};
/* block-matching optical flow between two canvases of equal size */
V.flow=function(a,b,step=16,search=6){const w=a.width,h=a.height,ga=V.gray(a.getContext('2d'),w,h),gb=V.gray(b.getContext('2d'),w,h),out=[],bs=8;
  for(let y=search+bs;y<h-search-bs;y+=step)for(let x=search+bs;x<w-search-bs;x+=step){let best=1e9,bx=0,by=0,base=0;
    for(let j=-bs;j<bs;j+=2)for(let i=-bs;i<bs;i+=2){const d=ga[(y+j)*w+x+i]-gb[(y+j)*w+x+i];base+=d*d;}
    for(let dy=-search;dy<=search;dy++)for(let dx=-search;dx<=search;dx++){let s=0;for(let j=-bs;j<bs;j+=2)for(let i=-bs;i<bs;i+=2){const d=ga[(y+j)*w+x+i]-gb[(y+j+dy)*w+x+i+dx];s+=d*d;}if(s<best-1e-6||(Math.abs(s-best)<1e-6&&dx*dx+dy*dy<bx*bx+by*by)){best=s;bx=dx;by=dy;}}
    let tex=0;for(let j=-bs;j<bs;j+=2)for(let i=-bs;i<bs;i+=2){tex+=Math.abs(ga[(y+j)*w+x+i]-ga[(y+j)*w+x+i+1]);}
    if(base<0.02||tex<0.4){bx=0;by=0;} out.push({x,y,dx:bx,dy:by});}
  return out;};
V.drawFlow=function(ctx,vecs,scale=4){ctx.save();ctx.lineWidth=2;vecs.forEach(v=>{const m=Math.hypot(v.dx,v.dy);if(m<1){ctx.fillStyle='rgba(160,170,200,.55)';ctx.fillRect(v.x-1,v.y-1,2,2);return;}
  const col=v.dy>Math.abs(v.dx)?'#f9c74f':'#4cc9f0';ctx.strokeStyle=col;ctx.fillStyle=col;const ex=v.x+v.dx*scale,ey=v.y+v.dy*scale;ctx.beginPath();ctx.moveTo(v.x,v.y);ctx.lineTo(ex,ey);ctx.stroke();
  const an=Math.atan2(ey-v.y,ex-v.x);ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-7*Math.cos(an-.5),ey-7*Math.sin(an-.5));ctx.lineTo(ex-7*Math.cos(an+.5),ey-7*Math.sin(an+.5));ctx.fill();});ctx.restore();};
window.Vision=V;
})();
