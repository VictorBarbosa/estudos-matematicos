import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorPotencialCapacitores as gerador } from '@features/eletromagnetismo/potencial-e-capacitores/potencial-e-capacitores.gerador';

const K = 8.99e9;
const EPS = 8.85e-12;
const n = (t: string): number => Number(t.replace(',', '.').replace(/[()]/g, ''));

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(7171);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

function esperado(en: string): number {
  let m = /potencial elétrico a (\S+) m de uma carga de (\S+) μC/.exec(en);
  if (m) return (K * n(m[2]!) * 1e-6) / n(m[1]!) / 1000;
  m = /capacitor de (\S+) μF é ligado a uma bateria de (\d+) V/.exec(en);
  if (m) return n(m[1]!) * n(m[2]!);
  m = /carga de (\S+) μC de um ponto a (\S+) V até um ponto a (\S+) V/.exec(en);
  if (m) return (n(m[1]!) * (n(m[3]!) - n(m[2]!))) / 1000;
  m = /placas paralelas de (\d+) cm² separadas por (\S+) mm de ar\. Qual é sua capacitância/.exec(
    en,
  );
  if (m) return ((EPS * n(m[1]!) * 1e-4) / (n(m[2]!) * 1e-3)) * 1e12;
  m = /capacitor de (\d+) μF carregado a (\d+) V/.exec(en);
  if (m) return 0.5 * n(m[1]!) * 1e-6 * n(m[2]!) ** 2 * 1000;
  m = /Capacitores de ([\d, ]+) μF estão ligados em (SÉRIE|PARALELO)/.exec(en);
  if (m) {
    const valores = m[1]!.split(',').map((v) => n(v.trim()));
    return m[2] === 'PARALELO'
      ? valores.reduce((a, b) => a + b, 0)
      : 1 / valores.reduce((a, b) => a + 1 / b, 0);
  }
  m = /a (\S+) m de uma carga de (\S+) μC e a (\S+) m de outra de (\S+) μC/.exec(en);
  if (m) return ((K * n(m[2]!) * 1e-6) / n(m[1]!) + (K * n(m[4]!) * 1e-6) / n(m[3]!)) / 1000;
  m = /C₁ = (\d+) μF .*?C₂ = (\d+) μF e C₃ = (\d+) μF, ligados a (\d+) V/.exec(en);
  if (m) {
    const [c1, c2, c3, v] = m.slice(1).map((x) => n(x!));
    const ceq = 1 / (1 / c1! + 1 / (c2! + c3!));
    return en.includes('carga fornecida') ? ceq * v! : ceq;
  }
  m = /placas de (\d+) cm², separadas por (\S+) mm de ar, é carregado a (\d+) V/.exec(en)!;
  const c = (EPS * n(m[1]!) * 1e-4) / (n(m[2]!) * 1e-3);
  return 0.5 * c * n(m[3]!) ** 2 * 1e9;
}

describe('geradorPotencialCapacitores', () => {
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
});
