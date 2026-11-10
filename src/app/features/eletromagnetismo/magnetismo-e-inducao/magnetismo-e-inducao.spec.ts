import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorMagnetismo as gerador } from '@features/eletromagnetismo/magnetismo-e-inducao/magnetismo-e-inducao.gerador';

const MU0 = 4 * Math.PI * 1e-7;
const E = 1.6e-19;
const n = (t: string): number => Number(t.replace(',', '.').replace(/[()]/g, ''));
const rad = (g: number) => (g * Math.PI) / 180;
const SOBRE = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const potencia = (t: string): number => {
  const [mantissa, exp] = t.split('×10');
  return n(mantissa!) * 10 ** SOBRE.indexOf(exp!);
};

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(7373);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

function esperado(en: string): number {
  let m =
    /carga (\S+) μC atravessa a (\d+) m\/s um campo magnético de (\S+) T, (?:formando (\d+)° com ele|perpendicular a ele)/.exec(
      en,
    );
  if (m) {
    const ang = m[4] ? n(m[4]) : 90;
    // |q v × B| com v no eixo x e B no plano xy.
    const v = [n(m[2]!), 0, 0];
    const b = [n(m[3]!) * Math.cos(rad(ang)), n(m[3]!) * Math.sin(rad(ang)), 0];
    const cruz = v[1]! * b[2]! - v[2]! * b[1]!;
    const cruz2 = v[2]! * b[0]! - v[0]! * b[2]!;
    const cruz3 = v[0]! * b[1]! - v[1]! * b[0]!;
    return Math.abs(n(m[1]!)) * 1e-6 * Math.hypot(cruz, cruz2, cruz3) * 1000;
  }
  m = /fio de (\S+) m, com corrente de (\d+) A, .*?campo magnético de (\S+) T/.exec(en);
  if (m) return n(m[3]!) * n(m[2]!) * n(m[1]!);
  m = /a (\d+) cm de um fio longo com (\d+) A/.exec(en);
  if (m) return ((MU0 * n(m[2]!)) / (2 * Math.PI * n(m[1]!) * 1e-2)) * 1e6;
  m = /espira de (\d+) cm² está num campo uniforme de (\S+) T, que forma (\d+)°/.exec(en);
  if (m) return n(m[2]!) * n(m[1]!) * 1e-4 * Math.cos(rad(n(m[3]!))) * 1000;
  m =
    /(próton|elétron) \(massa (\S+) kg, carga 1,6×10⁻¹⁹ C\) entra a (\S+) m\/s, perpendicular, num campo de (\S+) T/.exec(
      en,
    );
  if (m) {
    const massa = m[1] === 'próton' ? 1.67e-27 : 9.11e-31;
    const r = (massa * potencia(m[3]!)) / (E * n(m[4]!));
    return r * (m[1] === 'próton' ? 100 : 1000);
  }
  m =
    /bobina de (\d+) espiras, cada uma com (\d+) cm², .*?passa de (\S+) T para (\S+) T em (\S+) s/.exec(
      en,
    );
  if (m) {
    const [esp, a, b1, b2, dt] = m.slice(1).map((x) => n(x!));
    return Math.abs((esp! * (b2! - b1!) * a! * 1e-4) / dt!);
  }
  m = /solenoide de (\d+) cm tem (\d+) espiras e corrente de (\S+) A/.exec(en);
  if (m) return MU0 * (n(m[2]!) / (n(m[1]!) / 100)) * n(m[3]!) * 1000;
  m = /barra de (\S+) m desliza a (\d+) m\/s .*?campo de (\S+) T .*?tem (\S+) Ω/.exec(en);
  if (m) {
    const [l, v, b, r] = m.slice(1).map((x) => n(x!));
    const i = (b! * l! * v!) / r!;
    return en.includes('corrente induzida') ? i : b! * i * l!;
  }
  m = /acelerado por (\d+) V e entra perpendicular num campo de (\S+) T/.exec(en)!;
  const v = Math.sqrt((2 * E * n(m[1]!)) / 1.67e-27);
  return ((1.67e-27 * v) / (E * n(m[2]!))) * 100;
}

describe('geradorMagnetismo', () => {
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
