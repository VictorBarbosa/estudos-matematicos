import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorOptica as gerador } from '@features/ondas-e-fisica-moderna/optica/optica.gerador';

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(8484);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

const num = (t: string): number => Number(t.replace(',', '.'));
const rad = (g: number): number => (g * Math.PI) / 180;
const graus = (r: number): number => (r * 180) / Math.PI;
const imagem = (f: number, p: number): number => 1 / (1 / f - 1 / p);

function esperado(e: string): number {
  let m: RegExpExecArray | null;
  if ((m = /a ([\d,]+) × 10⁸ m\/s/.exec(e))) return 3 / num(m[1]!);
  if ((m = /do ar \(n = 1,00\) para .* \(n = ([\d,]+)\), fazendo (\d+)°/.exec(e))) {
    return graus(Math.asin(Math.sin(rad(num(m[2]!))) / num(m[1]!)));
  }
  if ((m = /\(n = ([\d,]+)\) para (?:a água \(n = 1,33\)|o ar \(n = 1,00\))/.exec(e))) {
    const n2 = e.includes('a água (n = 1,33)') ? 1.33 : 1;
    return graus(Math.asin(n2 / num(m[1]!)));
  }
  if (
    (m =
      /objeto está a (\d+) cm de uma lente (convergente|divergente) de distância focal (\d+) cm/.exec(
        e,
      ))
  ) {
    const f = num(m[3]!) * (m[2] === 'divergente' ? -1 : 1);
    return imagem(f, num(m[1]!));
  }
  if (
    (m =
      /objeto de (\d+) cm de altura está a ([\d,]+) cm de uma lente convergente de foco (\d+) cm/.exec(
        e,
      ))
  ) {
    const [h, p, f] = [num(m[1]!), num(m[2]!), num(m[3]!)];
    return (-imagem(f, p) / p) * h;
  }
  if (
    (m =
      /Luz de (\d+) nm passa por duas fendas separadas por ([\d,]+) mm, e a tela fica a ([\d,]+) m\. A que distância do centro está a (\d+)ª/.exec(
        e,
      ))
  ) {
    const [l, d, L, o] = [num(m[1]!), num(m[2]!), num(m[3]!), num(m[4]!)];
    return ((o * l * 1e-9 * L) / (d * 1e-3)) * 1e3;
  }
  if (
    (m =
      /separadas por ([\d,]+) mm e tela a ([\d,]+) m, a (\d+)ª franja clara aparece a ([\d,]+) mm/.exec(
        e,
      ))
  ) {
    const [d, L, o, y] = [num(m[1]!), num(m[2]!), num(m[3]!), num(m[4]!)];
    return ((y * 1e-3 * d * 1e-3) / (o * L)) * 1e9;
  }
  m =
    /a (\d+) cm uma da outra; a primeira tem foco (\d+) cm e a segunda, (\d+) cm\. Um objeto está a (\d+) cm/.exec(
      e,
    )!;
  const [D, f1, f2, p1] = [num(m[1]!), num(m[2]!), num(m[3]!), num(m[4]!)];
  return imagem(f2, D - imagem(f1, p1));
}

describe('geradorOptica', () => {
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

  it('a lente divergente sempre dá imagem virtual (p′ negativo)', () => {
    for (const e of amostra('dificil', 300)) {
      if (e.enunciado.includes('divergente')) expect(e.gabarito).toBeLessThan(0);
    }
  });
});
