import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorOndasESom as gerador } from '@features/ondas-e-fisica-moderna/ondas-e-som/ondas-e-som.gerador';

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(7373);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

const num = (t: string): number => Number(t.replace(',', '.'));

/** Refaz a conta a partir do texto do enunciado, sem usar o núcleo. */
function esperado(enunciado: string): number {
  let m: RegExpExecArray | null;
  if ((m = /comprimento de onda ([\d,]+) m e frequência (\d+) Hz/.exec(enunciado))) {
    return num(m[1]!) * num(m[2]!);
  }
  if ((m = /som de (\d+) Hz se propaga .* a (\d+) m\/s/.exec(enunciado))) {
    return num(m[2]!) / num(m[1]!);
  }
  if ((m = /tração de (\d+) N e tem densidade linear de ([\d,]+) (g|kg)\/m/.exec(enunciado))) {
    const mu = num(m[2]!) / (m[3] === 'g' ? 1000 : 1);
    return Math.sqrt(num(m[1]!) / mu);
  }
  if (
    (m =
      /corda de violão de ([\d,]+) m.*ondas a (\d+) m\/s\. Qual é a frequência (?:fundamental|do (\d+)º)/.exec(
        enunciado,
      ))
  ) {
    const n = m[3] ? num(m[3]) : 1;
    return (n * num(m[2]!)) / (2 * num(m[1]!));
  }
  if (
    (m = /corda de violão de ([\d,]+) m.*ondas a (\d+) m\/s\. Qual é a frequência fundamental/.exec(
      enunciado,
    ))
  ) {
    return num(m[2]!) / (2 * num(m[1]!));
  }
  if ((m = /intensidade de (?:(\d+) × )?10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+) W/.exec(enunciado))) {
    const SOB = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const exp = -Number(
      m[2]!
        .replace('⁻', '')
        .split('')
        .map((c) => SOB.indexOf(c))
        .join(''),
    );
    const I = (m[1] ? num(m[1]) : 1) * 10 ** exp;
    return 10 * Math.log10(I / 1e-12);
  }
  if ((m = /tubo de ([\d,]+) m (fechado|aberto).*Qual é a frequência do (\d+)º/.exec(enunciado))) {
    const L = num(m[1]!);
    return (num(m[3]!) * 340) / ((m[2] === 'fechado' ? 4 : 2) * L);
  }
  if (
    (m =
      /sirene de (\d+) Hz (se aproxima|se afasta) a (\d+) m\/s(?:, e o ouvinte (vai na direção dela|foge dela) a (\d+) m\/s)?/.exec(
        enunciado,
      ))
  ) {
    const vf = num(m[3]!) * (m[2] === 'se aproxima' ? 1 : -1);
    const vo = m[5] ? num(m[5]) * (m[4] === 'vai na direção dela' ? 1 : -1) : 0;
    return (num(m[1]!) * (340 + vo)) / (340 - vf);
  }
  m = /cordas de ([\d,]+) m.*ondas a (\d+) m\/s e a (\d+) m\/s/.exec(enunciado)!;
  const L = num(m[1]!);
  return Math.abs(num(m[3]!) - num(m[2]!)) / (2 * L);
}

describe('geradorOndasESom', () => {
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

  it('o tubo fechado só usa harmônicos ímpares', () => {
    for (const e of [...amostra('dificil', 300), ...amostra('extremo', 300)]) {
      const m = /fechado.*do (\d+)º harmônico/.exec(e.enunciado);
      if (m) expect(Number(m[1]) % 2).toBe(1);
    }
  });

  it('o Extremo traz Doppler com os dois em movimento e o batimento, que o Difícil não tem', () => {
    const extremo = amostra('extremo', 200).map((e) => e.enunciado);
    const dificil = amostra('dificil', 200).map((e) => e.enunciado);
    expect(extremo.some((t) => t.includes('o ouvinte vai') || t.includes('o ouvinte foge'))).toBe(
      true,
    );
    expect(extremo.some((t) => t.includes('batimentos'))).toBe(true);
    expect(dificil.some((t) => t.includes('batimentos'))).toBe(false);
  });
});
