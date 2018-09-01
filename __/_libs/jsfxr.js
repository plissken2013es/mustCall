function SfxrParams(){this.setSettings=function(r){for(var t=0;t<24;t++)this[String.fromCharCode(97+t)]=r[t]||0;this.c<.01&&(this.c=.01);var e=this.b+this.c+this.e;if(e<.18){var a=.18/e;this.b*=a,this.c*=a,this.e*=a}}}function SfxrSynth(){var O,Q,T,V,X,Y,Z,$,rr,tr,er,ar;this._params=new SfxrParams,this.reset=function(){var r=this._params;V=100/(r.f*r.f+.001),X=100/(r.g*r.g+.001),Y=1-r.h*r.h*r.h*.01,Z=-r.i*r.i*r.i*1e-6,r.a||(er=.5-r.n/2,ar=5e-5*-r.o),$=1+r.l*r.l*(0<r.l?-.9:10),rr=0,tr=1==r.m?0:(1-r.m)*(1-r.m)*2e4+32},this.totalReset=function(){this.reset();var r=this._params;return O=r.b*r.b*1e5,Q=r.c*r.c*1e5,T=r.e*r.e*1e5+12,3*((O+Q+T)/3|0)},this.synthWave=function(r,t){var e=this._params,a=1!=e.s||e.v,s=e.v*e.v*.1,n=1+3e-4*e.w,i=e.s*e.s*e.s*.1,h=1+1e-4*e.t,f=1!=e.s,c=e.x*e.x,o=e.g,v=e.q||e.r,u=e.r*e.r*e.r*.2,b=e.q*e.q*(e.q<0?-1020:1020),m=e.p?32+((1-e.p)*(1-e.p)*2e4|0):0,y=e.d,w=e.j/2,x=e.k*e.k*.01,p=e.a,g=O,k=1/O,l=1/Q,S=1/T,d=5/(1+e.u*e.u*20)*(.01+i);.8<d&&(d=.8),d=1-d;for(var j,q,A,M,_,U,C=!1,P=0,R=0,W=0,z=0,B=0,D=0,E=0,F=0,G=0,H=0,I=new Array(1024),J=new Array(32),K=I.length;K--;)I[K]=0;for(K=J.length;K--;)J[K]=2*Math.random()-1;for(K=0;K<t;K++){if(C)return K;if(m&&++G>=m&&(G=0,this.reset()),tr&&++rr>=tr&&(tr=0,V*=$),X<(V*=Y+=Z)&&(V=X,0<o&&(C=!0)),q=V,0<w&&(H+=x,q*=1+Math.sin(H)*w),(q|=0)<8&&(q=8),p||((er+=ar)<0?er=0:.5<er&&(er=.5)),++R>g)switch(R=0,++P){case 1:g=Q;break;case 2:g=T}switch(P){case 0:W=R*k;break;case 1:W=1+2*(1-R*l)*y;break;case 2:W=1-R*S;break;case 3:C=!(W=0)}v&&((A=0|(b+=u))<0?A=-A:1023<A&&(A=1023)),a&&n&&((s*=n)<1e-5?s=1e-5:.1<s&&(s=.1)),U=0;for(var L=8;L--;){if(q<=++E&&(E%=q,3==p))for(var N=J.length;N--;)J[N]=2*Math.random()-1;switch(p){case 0:_=E/q<er?.5:-.5;break;case 1:_=1-E/q*2;break;case 2:_=.225*(((_=1.27323954*(M=6.28318531*(.5<(M=E/q)?M-1:M))+.405284735*M*M*(M<0?1:-1))<0?-1:1)*_*_-_)+_;break;case 3:_=J[Math.abs(32*E/q|0)]}a&&(j=D,(i*=h)<0?i=0:.1<i&&(i=.1),f?(B+=(_-D)*i,B*=d):(D=_,B=0),z+=(D+=B)-j,_=z*=1-s),v&&(I[F%1024]=_,_+=I[(F-A+1024)%1024],F++),U+=_}U*=.125*W*c,r[K]=1<=U?32767:U<=-1?-32768:32767*U|0}return t}}var synth=new SfxrSynth,jsfxr=function(r){synth._params.setSettings(r);var t=synth.totalReset(),e=new Uint8Array(4*((t+1)/2|0)+44),a=2*synth.synthWave(new Uint16Array(e.buffer,44),t),s=new Uint32Array(e.buffer,0,44);s[0]=1179011410,s[1]=a+36,s[2]=1163280727,s[3]=544501094,s[4]=16,s[5]=65537,s[6]=44100,s[7]=88200,s[8]=1048578,s[9]=1635017060,s[10]=a,a+=44;for(var n=0,i="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",h="data:audio/wav;base64,";n<a;n+=3){var f=e[n]<<16|e[n+1]<<8|e[n+2];h+=i[f>>18]+i[f>>12&63]+i[f>>6&63]+i[63&f]}return h};"function"==typeof require?module.exports=jsfxr:this.jsfxr=jsfxr;