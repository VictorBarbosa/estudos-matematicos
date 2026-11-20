import { todasAsEntradas, vestirTexto } from '@core/enunciados/models/enunciado.model';
import { resolverPorRegras } from '@core/enunciados/models/regras-de-passos';
import { REGRAS_POR_TOPICO } from '@core/enunciados/models/regras.catalogo';

const ENTRADAS = todasAsEntradas().filter((e) => e['dados-calculo'] !== undefined);

describe('diagnóstico', () => {
  it('formas com marcador vazado', () => {
    const contagem = new Map<string, number>();
    for (const entrada of ENTRADAS) {
      const dados = entrada['dados-calculo']!;
      const texto = vestirTexto(entrada.enunciado.br, dados, 'pt');
      const r = resolverPorRegras(REGRAS_POR_TOPICO[entrada.topico], texto);
      if (r === null) continue;
      for (const passo of r.passos) {
        if (passo.tex.includes('#')) {
          const chave = `${entrada.topico}\t${passo.tex.replace(/-?\d+(?:[.,]\d+)?/g, 'N')}`;
          contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
          break;
        }
      }
    }
    const ord = [...contagem].sort((a, b) => b[1] - a[1]);
    let total = 0;
    for (const [, q] of ord) total += q;
    expect(
      ord.length,
      `VAZADO ${total} entradas em ${ord.length} formas\n` +
        ord.slice(0, 50).map(([f, q]) => `${q}\t${f}`).join("\n"),
    ).toBe(0);
  });
});
