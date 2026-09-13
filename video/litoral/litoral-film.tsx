import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';

const wine = '#651d32';
const coral = '#ffad94';
const white = '#fffdfc';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const photographs = {
  coast: 'images/litoral-experience/carneiros-real-1280.webp',
  couple: 'images/litoral-experience/porto-real-1280.webp',
  family: 'images/litoral-experience/muro-real-1280.webp',
  closing: 'images/litoral-experience/tamandare-real-1280.webp',
};

const Photo = ({src, position = 'center', drift = 1}: {src: string; position?: string; drift?: number}) => {
  const frame = useCurrentFrame();
  return <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, transform: `scale(${1.045 + frame / 660 * .055}) translateX(${Math.sin(frame / 660 * Math.PI) * drift * -1.2}%)`}} />;
};

const Chapter = ({start, end, children}: {start: number; end: number; children: React.ReactNode}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 15, end - 15, end], [0, 1, 1, 0], clamp);
  if (frame < start || frame > end) return null;
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const LitoralFilm = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const portrait = height > width;
  const pad = portrait ? 50 : 68;
  const titleStyle: React.CSSProperties = {fontSize: portrait ? 69 : 82, lineHeight: 1.08, fontWeight: 600, letterSpacing: '-.055em', margin: '20px 0 0'};
  const labelStyle: React.CSSProperties = {fontSize: portrait ? 17 : 15, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase'};
  const rise = (start: number) => interpolate(frame, [start, start + 26], [24, 0], clamp);
  const routeReveal = interpolate(frame, [165, 285], [0, 1], clamp);
  const stopNames = ['Porto de Galinhas', 'Muro Alto', 'Carneiros', 'Tamandaré'];
  const creditLines = frame < 330
    ? ['Carneiros: Vi Neves / Wikimedia Commons', 'CC BY 2.0 · creativecommons.org/licenses/by/2.0/ · recorte animado']
    : frame < 510
      ? ['Porto e Muro: Bruno Lima / MTur · Wikimedia Commons', 'Domínio público (PDM) · recortes e movimento editorial']
      : ['Tamandaré: Joao Vicente / Wikimedia Commons', 'CC BY 2.0 · creativecommons.org/licenses/by/2.0/ · recorte animado'];
  return <AbsoluteFill style={{background: wine, color: white, fontFamily: 'Manrope, sans-serif', overflow: 'hidden'}}>
    <Chapter start={-15} end={165}>
      <AbsoluteFill><Photo src={photographs.coast} position={portrait ? '62% center' : 'center'} /></AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(90deg,rgba(28,19,25,.76),rgba(28,19,25,.14)),linear-gradient(0deg,rgba(28,19,25,.7),transparent 70%)'}} />
      <div style={{position: 'absolute', left: pad, right: pad, top: portrait ? 260 : 192, transform: `translateY(${rise(0)}px)`}}>
        <div style={{...labelStyle, color: coral}}>Pernambuco · litoral sul</div>
        <h1 style={{...titleStyle, maxWidth: portrait ? 610 : 860}}>Seu próximo<br />capítulo tem mar.</h1>
        <div style={{fontSize: portrait ? 25 : 26, lineHeight: 1.5, marginTop: 27, maxWidth: 510}}>Uma pausa da rotina.<br />Um lugar para viver o agora.</div>
      </div>
    </Chapter>

    <Chapter start={150} end={345}>
      <AbsoluteFill><Photo src={photographs.coast} position="70% center" drift={-1} /></AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(90deg,rgba(60,15,32,.95),rgba(60,15,32,.82))'}} />
      <div style={{position: 'absolute', top: portrait ? 138 : 122, left: pad, right: pad, transform: `translateY(${rise(155)}px)`}}>
        <div style={{...labelStyle, color: coral}}>01 / encontre seu destino</div>
        <h2 style={{...titleStyle, fontSize: portrait ? 65 : 70}}>Escolha a praia.</h2>
        <p style={{fontSize: portrait ? 23 : 24, lineHeight: 1.5, maxWidth: 700}}>Quatro destinos. Muitas formas de estar perto do mar.</p>
      </div>
      <div style={{position: 'absolute', left: pad, right: pad, top: portrait ? 418 : 386}}>
        {portrait ? <>
          <div style={{position: 'absolute', width: 2, height: 246, top: 16, left: 15, background: '#ffffff32'}} />
          <div style={{position: 'absolute', width: 3, height: 246 * routeReveal, top: 16, left: 15, background: coral}} />
          {stopNames.map((name, index) => <div key={name} style={{height: 82, display: 'flex', gap: 25, alignItems: 'flex-start', opacity: interpolate(frame, [166 + index * 30, 186 + index * 30], [.2, 1], clamp)}}>
            <span style={{display: 'grid', placeItems: 'center', borderRadius: '50%', width: 32, height: 32, background: wine, border: `2px solid ${coral}`, color: coral, fontSize: 15, zIndex: 1}}>{index + 1}</span>
            <span style={{fontSize: 27, fontWeight: 600, marginTop: -2}}>{name}</span>
          </div>)}
        </> : <>
          <div style={{height: 2, background: '#ffffff32', position: 'absolute', left: 17, width: (width - pad * 2) * .75, top: 17}} />
          <div style={{height: 3, background: coral, position: 'absolute', left: 17, width: (width - pad * 2) * .75 * routeReveal, top: 17}} />
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)'}}>{stopNames.map((name, index) => <div key={name} style={{opacity: interpolate(frame, [166 + index * 30, 186 + index * 30], [.2, 1], clamp)}}>
            <div style={{display: 'grid', placeItems: 'center', position: 'relative', borderRadius: '50%', width: 34, height: 34, background: wine, border: `2px solid ${coral}`, color: coral, fontSize: 16}}>{index + 1}</div>
            <div style={{fontSize: 24, marginTop: 22, fontWeight: 600}}>{name}</div>
          </div>)}</div>
        </>}
        <div style={{fontSize: portrait ? 17 : 15, color: '#efd8df', marginTop: portrait ? 6 : 33}}>Percurso editorial ilustrativo · não é uma rota de navegação</div>
      </div>
    </Chapter>

    <Chapter start={330} end={525}>
      <AbsoluteFill style={{background: '#271b22'}} />
      <div style={{position: 'absolute', left: pad, right: pad, top: portrait ? 128 : 113, transform: `translateY(${rise(335)}px)`}}>
        <div style={{...labelStyle, color: coral}}>02 / imagine a temporada</div>
        <h2 style={{...titleStyle, fontSize: portrait ? 62 : 65, marginTop: 16}}>Encontre seu ritmo.</h2>
      </div>
      <div style={{position: 'absolute', left: pad, right: pad, top: portrait ? 285 : 270, display: 'grid', gridTemplateColumns: portrait ? '1fr' : '1fr 1fr', gap: 18}}>
        {[{src: photographs.couple, place: 'Porto de Galinhas', heading: 'A dois', sub: 'Tempo para se reconectar.'}, {src: photographs.family, place: 'Muro Alto', heading: 'Em família', sub: 'Espaço para novas memórias.'}].map((item, index) => <div key={item.heading} style={{position: 'relative', height: portrait ? 233 : 278, overflow: 'hidden', borderRadius: 4, transform: `translateY(${rise(340 + index * 8)}px)`}}>
          <Photo src={item.src} position={portrait ? 'center 56%' : 'center'} drift={index ? -1 : 1} />
          <AbsoluteFill style={{background: 'linear-gradient(0deg,rgba(22,12,18,.94),rgba(22,12,18,.08) 85%)'}} />
          <div style={{position: 'absolute', left: 24, top: 18, padding: '5px 10px', borderRadius: 2, background: 'rgba(25,15,21,.78)', fontSize: portrait ? 16 : 15, fontWeight: 600}}>{item.place}</div>
          <div style={{position: 'absolute', left: 24, bottom: 23, right: 20}}><div style={{fontSize: 32, fontWeight: 600, letterSpacing: '-.035em'}}>{item.heading}</div><div style={{fontSize: portrait ? 21 : 20, marginTop: 5}}>{item.sub}</div></div>
        </div>)}
      </div>
      <div style={{position: 'absolute', bottom: portrait ? 140 : 133, left: pad, fontSize: portrait ? 21 : 20, color: '#e6d9de'}}>Dias sem pressa. Uma estadia com o seu jeito.</div>
    </Chapter>

    <Chapter start={510} end={690}>
      <AbsoluteFill><Photo src={photographs.closing} position={portrait ? '62% center' : 'center'} drift={-1} /></AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(90deg,rgba(54,14,29,.84),rgba(54,14,29,.55))'}} />
      <div style={{position: 'absolute', left: pad, right: pad, top: portrait ? 236 : 165, transform: `translateY(${rise(515)}px)`}}>
        <div style={{...labelStyle, color: coral}}>03 / transforme inspiração em planos</div>
        <h2 style={{...titleStyle, fontSize: portrait ? 59 : 72, maxWidth: 1050}}>Imagine a estadia.<br />Confirme os detalhes.</h2>
        <p style={{fontSize: portrait ? 24 : 26, lineHeight: 1.5, marginTop: 27, maxWidth: 690}}>Explore os destinos e converse sobre datas, acomodações e condições.</p>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 22, borderTop: '1px solid #ffffff77', paddingTop: 24, marginTop: 15}}><span style={{fontSize: portrait ? 27 : 29, fontWeight: 600}}>Viva o litoral</span><span style={{fontSize: 18}}>·</span><span style={{fontSize: portrait ? 21 : 23}}>Jairo Rocha</span></div>
      </div>
    </Chapter>

    <div style={{position: 'absolute', left: pad, top: portrait ? 55 : 43, right: pad, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: portrait ? 18 : 16, fontWeight: 700, letterSpacing: '.09em'}}><span>JAIRO ROCHA</span><span style={{fontSize: portrait ? 14 : 13, opacity: .82}}>VIVER NO LITORAL</span></div>
    <div style={{position: 'absolute', bottom: portrait ? 84 : 77, left: pad, right: pad, fontSize: portrait ? 13 : 11, lineHeight: 1.5, color: '#fff', textShadow: '0 1px 3px #000'}}>{creditLines.map(line => <div key={line}>{line}</div>)}</div>
    <div style={{position: 'absolute', bottom: portrait ? 56 : 44, left: pad, right: pad, fontSize: portrait ? 15 : 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: white}}><span>Fotografias dos destinos · roteiro ilustrativo</span><span>{String(Math.min(22, Math.floor(frame / 30))).padStart(2, '0')} / 22</span></div>
    <div style={{position: 'absolute', bottom: portrait ? 38 : 27, height: 2, left: pad, right: pad, background: '#ffffff40'}}><div style={{width: `${frame / (durationInFrames - 1) * 100}%`, height: '100%', background: coral}} /></div>
  </AbsoluteFill>;
};
