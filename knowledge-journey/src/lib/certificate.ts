export interface CertificateData {
  name: string;
  title: string;
  xp: number;
  gems: number;
  accuracy: number;
  completed: number;
  date: Date;
}

export const CERT_W = 1600;
export const CERT_H = 1131;

async function ensureFonts() {
  if (!document.fonts?.load) return;
  await Promise.all([
    document.fonts.load('700 80px "El Messiri"', 'شهادة'),
    document.fonts.load('500 40px "El Messiri"', 'شهادة'),
    document.fonts.load('400 30px "Readex Pro"', 'شهادة'),
    document.fonts.load('600 30px "Readex Pro"', 'شهادة'),
  ]).catch(() => undefined);
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function gem(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, c1: string, c2: string) {
  const g = ctx.createLinearGradient(x, y - s, x, y + s);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.55, y - s * 0.6);
  ctx.lineTo(x + s * 0.55, y - s * 0.6);
  ctx.lineTo(x + s, y - s * 0.1);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s, y - s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y - s * 0.5);
  ctx.lineTo(x - s * 0.05, y - s * 0.5);
  ctx.lineTo(x - s * 0.25, y - s * 0.15);
  ctx.closePath();
  ctx.fill();
}

/** Draws the certificate. Returns the canvas (used for preview, PNG download and print). */
export async function drawCertificate(d: CertificateData, canvas = document.createElement('canvas')): Promise<HTMLCanvasElement> {
  await ensureFonts();
  canvas.width = CERT_W;
  canvas.height = CERT_H;
  const ctx = canvas.getContext('2d')!;
  const W = CERT_W;
  const H = CERT_H;

  // background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#fffaf2');
  bg.addColorStop(0.55, '#f7f0ff');
  bg.addColorStop(1, '#ffeef3');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.36, 40, W / 2, H * 0.36, 620);
  glow.addColorStop(0, 'rgba(255,214,110,.28)');
  glow.addColorStop(1, 'rgba(255,214,110,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // scattered stars
  let seed = 3;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 40; i++) star(ctx, 80 + rnd() * (W - 160), 80 + rnd() * (H - 160), 3 + rnd() * 5, `rgba(${rnd() > 0.5 ? '245,192,72' : '162,131,241'},${0.18 + rnd() * 0.25})`);

  // frame
  ctx.lineWidth = 10;
  const gold = ctx.createLinearGradient(0, 0, W, 0);
  gold.addColorStop(0, '#e09e2c');
  gold.addColorStop(0.5, '#ffe6a3');
  gold.addColorStop(1, '#e09e2c');
  ctx.strokeStyle = gold;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#a283f1';
  ctx.strokeRect(62, 62, W - 124, H - 124);
  for (const [x, y] of [
    [62, 62],
    [W - 62, 62],
    [62, H - 62],
    [W - 62, H - 62],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#fff6d1';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e09e2c';
    ctx.stroke();
    star(ctx, x, y, 16, '#f5c048');
  }

  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // crown of gems
  const hues: [string, string][] = [
    ['#efe4ff', '#6745bd'],
    ['#fff6d6', '#e09e2c'],
    ['#ffe6f1', '#ef82b2'],
    ['#dcfffb', '#19b2ae'],
    ['#e6f9ff', '#4aa3d6'],
    ['#fff0ea', '#ff8a6e'],
    ['#fff6d6', '#e09e2c'],
    ['#efe4ff', '#6745bd'],
  ];
  for (let i = 0; i < 8; i++) {
    const a = Math.PI + (Math.PI / 9) * (i + 1);
    const x = W / 2 + Math.cos(a) * 190;
    const y = 250 + Math.sin(a) * 120;
    const on = i < d.gems;
    ctx.globalAlpha = on ? 1 : 0.25;
    gem(ctx, x, y, 20, hues[i][0], hues[i][1]);
  }
  ctx.globalAlpha = 1;
  star(ctx, W / 2, 160, 34, '#f5c048');

  ctx.fillStyle = '#4e3196';
  ctx.font = '700 86px "El Messiri", "Readex Pro", sans-serif';
  ctx.fillText('شهادة إنجاز', W / 2, 330);

  ctx.fillStyle = '#55467e';
  ctx.font = '400 32px "Readex Pro", sans-serif';
  ctx.fillText('تشهد «رحلة إلى كنوز المعرفة» بأنّ الطالبة', W / 2, 410);

  // name
  const name = d.name || 'المستكشفة';
  let size = 104;
  ctx.font = `700 ${size}px "El Messiri", "Readex Pro", sans-serif`;
  while (ctx.measureText(name).width > W - 360 && size > 50) {
    size -= 6;
    ctx.font = `700 ${size}px "El Messiri", "Readex Pro", sans-serif`;
  }
  const ng = ctx.createLinearGradient(0, 430, 0, 540);
  ng.addColorStop(0, '#e09e2c');
  ng.addColorStop(1, '#a86412');
  ctx.fillStyle = ng;
  ctx.fillText(name, W / 2, 530);
  ctx.strokeStyle = 'rgba(224,158,44,.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 360, 560);
  ctx.lineTo(W / 2 + 360, 560);
  ctx.stroke();

  ctx.fillStyle = '#55467e';
  ctx.font = '400 32px "Readex Pro", sans-serif';
  ctx.fillText('أتمّت رحلة درس «من مصادر التشريع الإسلامي (1)»، ونالت لقب', W / 2, 625);

  // title ribbon
  ctx.font = '700 60px "El Messiri", "Readex Pro", sans-serif';
  const tw = ctx.measureText(d.title).width + 120;
  const rg = ctx.createLinearGradient(W / 2 - tw / 2, 0, W / 2 + tw / 2, 0);
  rg.addColorStop(0, '#8260dc');
  rg.addColorStop(1, '#ef82b2');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.roundRect(W / 2 - tw / 2, 660, tw, 96, 48);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(d.title, W / 2, 730);

  // stats
  const stats = [
    [`${d.completed} / 8`, 'الجزر المكتملة'],
    [`${d.xp}`, 'نقاط الخبرة'],
    [`${d.gems}`, 'الجواهر'],
    [`${d.accuracy}%`, 'الإجابات الصحيحة'],
  ];
  const sw = 250;
  const startX = W / 2 + ((stats.length - 1) * sw) / 2;
  stats.forEach(([v, l], i) => {
    const x = startX - i * sw;
    ctx.fillStyle = 'rgba(162,131,241,.12)';
    ctx.beginPath();
    ctx.roundRect(x - 105, 800, 210, 120, 24);
    ctx.fill();
    ctx.fillStyle = '#4e3196';
    ctx.font = '700 46px "El Messiri", "Readex Pro", sans-serif';
    ctx.fillText(v, x, 860);
    ctx.fillStyle = '#55467e';
    ctx.font = '400 24px "Readex Pro", sans-serif';
    ctx.fillText(l, x, 900);
  });

  // footer
  ctx.font = '400 26px "Readex Pro", sans-serif';
  ctx.fillStyle = '#55467e';
  const date = new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' }).format(d.date);
  ctx.textAlign = 'right';
  ctx.fillText(`التاريخ: ${date}`, W - 150, 1010);
  ctx.textAlign = 'left';
  ctx.fillText('توقيع المعلمة: ..................', 150, 1010);
  ctx.textAlign = 'center';
  ctx.font = '500 24px "El Messiri", "Readex Pro", sans-serif';
  ctx.fillStyle = '#8260dc';
  ctx.fillText('مع تحيات «سَنا» نجمة المعرفة', W / 2, 1040);
  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, 'image/png');
}
