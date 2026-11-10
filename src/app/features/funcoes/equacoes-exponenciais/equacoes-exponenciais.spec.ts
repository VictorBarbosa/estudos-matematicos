import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEquacoesExponenciais as gerador } from '@features/funcoes/equacoes-exponenciais/equacoes-exponenciais.gerador';

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(3131);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

/** Lê o enunciado em LaTeX e devolve «lado esquerdo − lado direito» como função de x. */
function residuo(tex: string): ((x: number) => number) | null {
  let m = /^(?:(\d+) \\cdot )?(\d+)\^\{(.+?)\} = (?:\\frac\{1\}\{(\d+)\}|(\d+))$/.exec(tex);
  if (m) {
    const k = Number(m[1] ?? 1);
    const base = Number(m[2]);
    const expoente = m[3]!.replace(/\s/g, '');
    const direita = m[4] ? 1 / Number(m[4]) : Number(m[5]);
    const e = (x: number) =>
      expoente === 'x' ? x : Number(new Function('x', `return ${expoente};`)(x));
    return (x) => k * base ** e(x) - direita;
  }
  m = /^(\d+)\^\{x\} = (\d+)\^\{x - (\d+)\}$/.exec(tex);
  if (m) return (x) => x * Math.log(Number(m![1])) - (x - Number(m![3])) * Math.log(Number(m![2]));
  m = /^\\log_\{(\d+)\} x \+ \\log_\{\d+\} \(x \+ (\d+)\) = (\d+)$/.exec(tex);
  if (m) {
    const [b, k, n] = [Number(m[1]), Number(m[2]), Number(m[3])];
    return (x) => Math.log(x) / Math.log(b) + Math.log(x + k) / Math.log(b) - n;
  }
  m = /^P\(t\) = (\d+)\\,e\^\{([\d{},]+)t\} = (\d+)$/.exec(tex);
  if (m) {
    const r = Number(m[2]!.replace('{,}', '.'));
    return (t) => Number(m![1]) * Math.exp(r * t) - Number(m![3]);
  }
  m = /^(\d+)\^\{x\}(?: ([+-]) (\d*) \\cdot (\d+)\^\{x\})?(?: ([+-]) (\d+))? = 0$/.exec(tex);
  if (m) {
    const nome = Number(m[1]);
    const p = m[2] ? (m[2] === '-' ? -1 : 1) * Number(m[3] || 1) : 0;
    const a = Number(m[4] ?? Math.sqrt(nome));
    const q = m[5] ? (m[5] === '-' ? -1 : 1) * Number(m[6]) : 0;
    return (x) => nome ** x + p * a ** x + q;
  }
  return null;
}

describe('geradorEquacoesExponenciais', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito satisfaz a equação do enunciado`, () => {
      for (const e of amostra(nivel)) {
        const f = residuo(e.enunciadoTex);
        expect(f, e.enunciadoTex).not.toBeNull();
        const valor = f!(e.gabarito);
        expect(Math.abs(valor), `${e.enunciadoTex} em ${e.gabarito}`).toBeLessThan(
          1e-6 * Math.max(1, Math.abs(f!(0))),
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito e o gabarito é aceito`, () => {
      for (const e of amostra(nivel, 60)) {
        for (const a of e.armadilhas)
          expect(Math.abs(a.resposta - e.gabarito)).toBeGreaterThan(1e-4);
        expect(corrigir(gerador, e, gerador.formatar(e.gabarito)).veredito).toBe('correto');
      }
    });
  }

  it('na soma de logs, a raiz negativa fica de fora e o gabarito é positivo', () => {
    const casos = amostra('medio', 300).filter((e) => e.conceitos.includes('expeq.dominio'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      expect(e.gabarito).toBeGreaterThan(0);
      expect(e.armadilhas.some((a) => a.resposta < 0)).toBe(true);
    }
  });

  it('no Extremo, a substituição tem um t negativo a descartar', () => {
    const casos = amostra('extremo', 300).filter((e) => e.conceitos.includes('expeq.substituicao'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) expect(e.resolucao.passos[2]!.descricao).toContain('sempre positivo');
  });
});
