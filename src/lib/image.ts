// O Netlify Image CDN gera derivativos sob demanda a partir do arquivo em /public,
// negociando o formato conforme o navegador. As fotografias originais seguem
// intactas no repositório: nada é reprocessado no build.
//
// O endpoint só existe quando o site está servido pelo Netlify. Em um build local
// (`astro build` seguido de `astro preview`) o caminho original é emitido, senão
// cada miniatura viraria um 404 na revisão local.
const onNetlify = process.env.NETLIFY === 'true';

type Options = {width: number; height?: number; quality?: number};

export function sized(src: string, {width, height, quality = 72}: Options): string {
  if (!onNetlify || !src.startsWith('/')) return src;
  const params = new URLSearchParams({url: src, w: String(width)});
  // Sem altura o CDN respeita a proporção original; com altura, recorta pelo centro
  // para acompanhar o `object-fit:cover` do CSS.
  if (height) {
    params.set('h', String(height));
    params.set('fit', 'cover');
  }
  params.set('q', String(quality));
  return `/.netlify/images?${params}`;
}
