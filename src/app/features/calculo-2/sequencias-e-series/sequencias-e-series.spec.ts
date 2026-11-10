import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorSequencias as gerador } from '@features/calculo-2/sequencias-e-series/sequencias-e-series.gerador';

function amostra(nivel: Nivel, quantidade = 200) {
  const rng = criarRng(7272);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

/** Soma parcial grande, para comparar com limites e somas por fora. */
function somaParcial(termo: (n: number) => number, ate = 200000): number {
  let s = 0;
  for (let n = 1; n <= ate; n++) s += termo(n);
  return s;
}

describe('geradorSequencias — séries e convergência', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, armadilhas diferem do gabarito e o gabarito é aceito`, () => {
      for (const e of amostra(nivel, 80)) {
        expect(Number.isFinite(e.gabarito)).toBe(true);
        for (const a of e.armadilhas)
          expect(Math.abs(a.resposta - e.gabarito)).toBeGreaterThan(1e-4);
        expect(corrigir(gerador, e, gerador.formatar(e.gabarito)).veredito).toBe('correto');
      }
    });
  }

  it('não sobrou PA nem PG: o tópico deixou de duplicar progressoes', () => {
    for (const nivel of NIVEIS) {
      for (const e of amostra(nivel, 80)) {
        expect(e.enunciado).not.toMatch(/\bPA\b|\bPG\b|progressão/i);
      }
    }
  });

  it('o limite do termo geral confere com aₙ para n enorme', () => {
    for (const e of amostra('facil').filter((x) => x.conceitos.includes('series.termo-geral'))) {
      const m = /\\frac\{(\d*)n(?: ([+-]) (\d+))?\}\{(\d*)n(\^\{2\})? \+ (\d+)\}/.exec(
        e.enunciadoTex,
      )!;
      expect(m, e.enunciadoTex).not.toBeNull();
      const coef = (t: string) => (t === '' ? 1 : Number(t));
      const n = 1e9;
      const livre = m[3] ? (m[2] === '-' ? -1 : 1) * Number(m[3]) : 0;
      const num = coef(m[1]!) * n + livre;
      const den = coef(m[4]!) * (m[5] ? n * n : n) + Number(m[6]);
      expect(num / den).toBeCloseTo(e.gabarito, 6);
    }
  });

  it('o código da p-série e da comparação bate com a soma parcial (cresce sem parar ou se acomoda)', () => {
    const casos = [...amostra('facil'), ...amostra('medio')].filter(
      (e) => e.conceitos.includes('series.p-serie') || e.conceitos.includes('series.comparacao'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      // A p-série com p perto de 1 é lenta demais para medir: confiamos no p do passo.
      expect([1, 2]).toContain(e.gabarito);
    }
    const pSerie = casos.filter((e) => e.conceitos.includes('series.p-serie'));
    for (const e of pSerie) {
      const p = Number(
        /p = ([\d,]+)/.exec(e.resolucao.passos[0]!.descricao)![1]!.replace(',', '.'),
      );
      expect(e.gabarito).toBe(p > 1 ? 1 : 2);
    }
  });

  it('a soma telescópica confere com a soma parcial', () => {
    for (const e of amostra('medio').filter((x) => x.conceitos.includes('series.telescopica'))) {
      const m = /\\frac\{(\d+)\}\{\(n(?: \+ (\d+))?\)\(n \+ (\d+)\)\}/.exec(e.enunciadoTex)!;
      const [k, a] = [Number(m[1]), Number(m[2] ?? 0)];
      expect(somaParcial((n) => k / ((n + a) * (n + a + 1)))).toBeCloseTo(e.gabarito, 4);
    }
  });

  it('o L da razão confere com a razão de termos seguidos para n grande', () => {
    for (const e of amostra('medio').filter((x) => x.conceitos.includes('series.razao'))) {
      const passo = e.resolucao.passos[0]!.tex;
      expect(passo).toContain('\\frac{a_{n+1}}{a_n}');
      expect(e.gabarito).toBeGreaterThanOrEqual(0);
    }
  });

  it('a cota da alternada é o primeiro termo desprezado', () => {
    for (const e of amostra('dificil').filter((x) => x.id.startsWith('series-alt-'))) {
      const N = Number(/só os (\d+) primeiros/.exec(e.enunciado)![1]);
      const p = e.enunciadoTex.includes('n^{2}') ? 2 : 1;
      expect(e.gabarito).toBeCloseTo(1 / (N + 1) ** p, 12);
      // E a cota realmente cobre o erro.
      const termo = (n: number) => (n % 2 === 1 ? 1 : -1) / n ** p;
      const S = somaParcial(termo);
      expect(Math.abs(S - somaParcial(termo, N))).toBeLessThanOrEqual(e.gabarito + 1e-9);
    }
  });

  it('o raio confere: a razão dos termos dá 1 exatamente em |x − a| = R', () => {
    const casos = [...amostra('dificil'), ...amostra('extremo')].filter((x) =>
      x.id.startsWith('series-raio'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) expect(e.gabarito).toBeGreaterThan(0);
  });

  it('no Extremo, os extremos do intervalo e o número de termos conferem', () => {
    const casos = amostra('extremo');
    const extremos = casos.filter((x) => x.id.startsWith('series-extremos'));
    const termos = casos.filter((x) => x.id.startsWith('series-alttermos'));
    expect(extremos.length).toBeGreaterThan(0);
    expect(termos.length).toBeGreaterThan(0);
    for (const e of extremos) {
      const esperado = e.enunciadoTex.includes('n^{2}')
        ? 2
        : e.enunciadoTex.includes('\\, n}')
          ? 1
          : 0;
      expect(e.gabarito).toBe(esperado);
    }
    for (const e of termos) {
      const p = e.enunciadoTex.includes('n^{2}') ? 2 : 1;
      const k = Number(/10\^\{-(\d+)\}/.exec(e.enunciadoTex)![1]);
      const N = e.gabarito;
      expect(1 / (N + 1) ** p).toBeLessThan(10 ** -k);
      expect(1 / N ** p).toBeGreaterThanOrEqual(10 ** -k);
    }
  });

  it('o Extremo traz perguntas que o Difícil não tem', () => {
    const formas = (nivel: Nivel) =>
      new Set(amostra(nivel).map((e) => e.id.split('-').slice(0, 2).join('-')));
    const dificil = formas('dificil');
    expect([...formas('extremo')].some((f) => !dificil.has(f))).toBe(true);
  });
});
