import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorCircuitos as gerador } from '@features/eletromagnetismo/circuitos/circuitos.gerador';

const n = (t: string): number => Number(t.replace(',', '.'));

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(7272);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

function esperado(en: string): number {
  let m = /resistor de (\d+) Ω está ligado a (\S+) V\. Qual corrente/.exec(en);
  if (m) return (n(m[2]!) / n(m[1]!)) * 1000;
  m = /corrente de (\S+) A atravessa um resistor de (\d+) Ω/.exec(en);
  if (m) return n(m[2]!) * n(m[1]!) ** 2;
  m = /resistor de (\d+) Ω está ligado a (\d+) V\. Quanta potência/.exec(en);
  if (m) return n(m[2]!) ** 2 / n(m[1]!);
  m = /Resistores de ([\d, ]+) Ω estão ligados em (SÉRIE|PARALELO)/.exec(en);
  if (m) {
    const valores = m[1]!.split(',').map((v) => n(v.trim()));
    return m[2] === 'SÉRIE'
      ? valores.reduce((a, b) => a + b, 0)
      : 1 / valores.reduce((a, b) => a + 1 / b, 0);
  }
  m = /R₁ = (\S+) kΩ e R₂ = (\S+) kΩ estão em série com uma fonte de (\d+) V/.exec(en);
  if (m) return (n(m[3]!) * n(m[2]!)) / (n(m[1]!) + n(m[2]!));
  m =
    /R₁ = (\d+) Ω está em série com o paralelo de R₂ = (\d+) Ω e R₃ = (\d+) Ω, tudo ligado a (\d+) V/.exec(
      en,
    );
  if (m) {
    const [r1, r2, r3, v] = m.slice(1).map((x) => n(x!));
    return v! / (r1! + 1 / (1 / r2! + 1 / r3!));
  }
  m =
    /bateria de (\d+) V e outra de (\d+) V (em OPOSIÇÃO|no MESMO).*?resistores de (\d+) Ω e (\d+) Ω/.exec(
      en,
    );
  if (m) {
    const [e1, e2, , r1, r2] = [n(m[1]!), n(m[2]!), m[3], n(m[4]!), n(m[5]!)];
    return (m[3]!.includes('OPOSIÇÃO') ? e1 - e2 : e1 + e2) / (r1 + r2);
  }
  m = /R = (\S+) kΩ e C = (\d+) μF\. Qual é a constante/.exec(en);
  if (m) return n(m[1]!) * n(m[2]!);
  m =
    /capacitor de (\d+) μF, .*?fonte de (\d+) V através de (\d+) kΩ\. Qual é a carga dele após (\S+) s/.exec(
      en,
    );
  if (m) {
    const [c, v, r, t] = m.slice(1).map((x) => n(x!));
    // Integração numérica de R dq/dt = V − q/C, independente da fórmula fechada.
    const tau = r! * 1e3 * c! * 1e-6;
    let q = 0;
    const passos = 200000;
    const dt = t! / passos;
    for (let i = 0; i < passos; i++) q += ((c! * v! - q) / tau) * dt;
    return q;
  }
  m =
    /(\d+) V em série com (\d+) Ω, e (\d+) V em série com (\d+) Ω — estão em paralelo com um resistor de (\d+) Ω/.exec(
      en,
    )!;
  const [e1, r1, e2, r2, r3] = m.slice(1).map((x) => n(x!));
  // Resolve o sistema das malhas por eliminação: correntes I1 (ramo 1) e I2 (ramo 2), I3 = I1 + I2.
  // ε1 = R1·I1 + R3·(I1 + I2);  ε2 = R2·I2 + R3·(I1 + I2)
  const a11 = r1! + r3!;
  const a12 = r3!;
  const a21 = r3!;
  const a22 = r2! + r3!;
  const det = a11 * a22 - a12 * a21;
  const i1 = (e1! * a22 - a12 * e2!) / det;
  const i2 = (a11 * e2! - a21 * e1!) / det;
  return i1 + i2;
}

describe('geradorCircuitos', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com o cálculo independente`, () => {
      for (const e of amostra(nivel)) {
        const alvo = esperado(e.enunciado);
        expect(Math.abs(e.gabarito - alvo), e.enunciado).toBeLessThan(
          1e-3 * Math.max(1, Math.abs(alvo)),
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
});
