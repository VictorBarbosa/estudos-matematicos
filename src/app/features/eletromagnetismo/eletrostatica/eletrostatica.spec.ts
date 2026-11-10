import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEletrostatica as gerador } from '@features/eletromagnetismo/eletrostatica/eletrostatica.gerador';

const K = 8.99e9;
const n = (t: string): number => Number(t.replace(',', '.').replace(/[()]/g, ''));

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(7070);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

/** Recalcula a resposta lendo os números do enunciado. */
function esperado(enunciado: string): number {
  let m = /q₁ = (\S+) μC e q₂ = (\S+) μC, estão a (\S+) (cm|m)/.exec(enunciado);
  if (m) {
    const r = n(m[3]!) / (m[4] === 'cm' ? 100 : 1);
    return (K * Math.abs(n(m[1]!) * n(m[2]!)) * 1e-12) / (r * r);
  }
  m = /carga de (\S+) μC a (\S+) m dela/.exec(enunciado);
  if (m) return (K * Math.abs(n(m[1]!)) * 1e-6) / n(m[2]!) ** 2 / 1000;
  m = /carga de (\S+) μC é colocada num campo elétrico uniforme de (\d+) N\/C/.exec(enunciado);
  if (m) return Math.abs(n(m[1]!)) * 1e-6 * n(m[2]!) * 1000;
  m =
    /multiplicada por (\d+), a outra por (\d+), e a distância entre elas é multiplicada por (\S+)\./.exec(
      enunciado,
    );
  if (m) return (n(m[1]!) * n(m[2]!)) / n(m[3]!) ** 2;
  m =
    /A = (\S+) μC à esquerda, M = (\d+) μC no meio e B = (\S+) μC à direita\. M está a (\S+) m de A e a (\S+) m de B/.exec(
      enunciado,
    );
  if (m) {
    const [qa, qm, qb, da, db] = m.slice(1).map((v) => n(v!));
    return (K * qa! * qm! * 1e-12) / da! ** 2 - (K * qb! * qm! * 1e-12) / db! ** 2;
  }
  m =
    /carga de (\d+) μC está no vértice.*?a (\S+) m, há uma carga de (\d+) μC; sobre o outro, a (\S+) m, uma de (\d+) μC/.exec(
      enunciado,
    );
  if (m) {
    const [q, d1, q1, d2, q2] = m.slice(1).map((v) => n(v!));
    return Math.hypot((K * q! * q1! * 1e-12) / d1! ** 2, (K * q! * q2! * 1e-12) / d2! ** 2);
  }
  m = /de (\d+) μC e (\d+) μC, estão a (\d+) cm/.exec(enunciado)!;
  const [q1, q2, d] = m.slice(1).map((v) => n(v!));
  // Busca numérica do zero do campo entre as cargas.
  let [a, b] = [1e-9, d! - 1e-9];
  const campo = (x: number) => q1! / (x * x) - q2! / ((d! - x) * (d! - x));
  for (let i = 0; i < 200; i++) {
    const meio = (a + b) / 2;
    if (campo(meio) > 0) a = meio;
    else b = meio;
  }
  return (a + b) / 2;
}

describe('geradorEletrostatica', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com o cálculo independente`, () => {
      for (const e of amostra(nivel)) {
        const alvo = esperado(e.enunciado);
        expect(Math.abs(e.gabarito - alvo), e.enunciado).toBeLessThan(
          1e-6 * Math.max(1, Math.abs(alvo)),
        );
      }
    });

    it(`no nível ${nivel}, armadilhas diferem e o gabarito arredondado é aceito`, () => {
      for (const e of amostra(nivel, 60)) {
        for (const a of e.armadilhas)
          expect(Math.abs(a.resposta - e.gabarito)).toBeGreaterThan(1e-3);
        expect(corrigir(gerador, e, gerador.formatar(e.gabarito)).veredito).toBe('correto');
      }
    });
  }

  it('o Extremo não repete nenhuma pergunta do Difícil', () => {
    const forma = (s: string) => s.slice(0, 20);
    const dificil = new Set(amostra('dificil').map((e) => forma(e.enunciado)));
    for (const e of amostra('extremo')) expect(dificil.has(forma(e.enunciado))).toBe(false);
  });
});
