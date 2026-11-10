import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorFisicaModerna as gerador } from '@features/ondas-e-fisica-moderna/fisica-moderna/fisica-moderna.gerador';

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(9595);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

const num = (t: string): number => Number(t.replace(',', '.'));
const gama = (b: number): number => 1 / Math.sqrt(1 - b * b);

function esperado(e: string): number {
  let m: RegExpExecArray | null;
  if ((m = /fóton de luz com comprimento de onda (\d+) nm/.exec(e))) return 1240 / num(m[1]!);
  if ((m = /nave viaja a ([\d,]+)c\. Qual é o fator/.exec(e))) return gama(num(m[1]!));
  if ((m = /múon vive em média 2,2 µs .* a ([\d,]+)c/.exec(e))) return 2.2 * gama(num(m[1]!));
  if ((m = /a ([\d,]+)c marca (\d+) h/.exec(e))) return num(m[2]!) * gama(num(m[1]!));
  if ((m = /mede (\d+) m em repouso\. Passando a ([\d,]+)c/.exec(e)))
    return num(m[1]!) / gama(num(m[2]!));
  if ((m = /Luz de (\d+) nm incide sobre .*, cuja função trabalho é ([\d,]+) eV/.exec(e))) {
    return 1240 / num(m[1]!) - num(m[2]!);
  }
  if ((m = /função trabalho do .* é ([\d,]+) eV\. Qual é o MAIOR/.exec(e)))
    return 1240 / num(m[1]!);
  if ((m = /se move a ([\d,]+) × 10⁶ m\/s/.exec(e))) {
    return (6.626e-34 / (9.11e-31 * num(m[1]!) * 1e6)) * 1e9;
  }
  if ((m = /vive ([\d,]+) vezes mais/.exec(e))) {
    const g = num(m[1]!);
    return Math.sqrt(1 - 1 / (g * g));
  }
  m = /mc² = 511 keV\) se move a ([\d,]+)c/.exec(e)!;
  return (gama(num(m[1]!)) - 1) * 511;
}

describe('geradorFisicaModerna', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com a conta refeita do enunciado`, () => {
      for (const e of amostra(nivel)) {
        expect(e.gabarito, e.enunciado).toBeCloseTo(esperado(e.enunciado), 6);
      }
    });

    it(`no nível ${nivel}, armadilhas diferem e o gabarito exibido é aceito`, () => {
      for (const e of amostra(nivel, 60)) {
        for (const a of e.armadilhas)
          expect(Math.abs(a.resposta - e.gabarito)).toBeGreaterThan(1e-3);
        expect(corrigir(gerador, e, gerador.formatar(e.gabarito)).veredito).toBe('correto');
      }
    });
  }

  it('no fotoelétrico a energia cinética é sempre positiva (λ abaixo do corte)', () => {
    for (const e of [...amostra('medio', 300), ...amostra('dificil', 300)]) {
      if (e.enunciado.includes('energia cinética máxima')) expect(e.gabarito).toBeGreaterThan(0);
    }
  });

  it('γ é sempre maior que 1 e a dilatação aumenta o tempo', () => {
    for (const e of [...amostra('facil', 200), ...amostra('medio', 200)]) {
      if (e.enunciado.includes('fator de Lorentz')) expect(e.gabarito).toBeGreaterThan(1);
      const m = /marca (\d+) h/.exec(e.enunciado);
      if (m) expect(e.gabarito).toBeGreaterThan(Number(m[1]));
    }
  });
});
