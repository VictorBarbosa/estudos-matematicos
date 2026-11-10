import { derivadaNumerica } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorCadeia } from '@features/calculo-1/regra-da-cadeia/regra-da-cadeia.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2828);
  return Array.from({ length: quantidade }, () => geradorCadeia.gerar(nivel, rng));
}

describe('geradorCadeia', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito da potência de binômio é inteiro`, () => {
      // As cascas de raiz, exponencial, ln e seno (só no Extremo) dão decimais.
      // A potência de binômio original; derivada segunda e três camadas têm testes próprios.
      for (const exercicio of amostra(nivel).filter(
        (e) => e.enunciadoTex.includes('\\right)^{') && !e.id.startsWith('cadeia-tres'),
      )) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.01);
        }
      }
    });
  }

  it('o gabarito confere com a derivada numérica', () => {
    for (const exercicio of amostra('medio', 40).filter(
      (e) => !e.id.startsWith('cadeia-segunda') && !e.id.startsWith('cadeia-tres'),
    )) {
      const [, aTexto, sinal, bTexto, nTexto] =
        /\\left\((\d*)x ([+-]) (\d+)\\right\)\^\{(\d+)\}/.exec(exercicio.enunciadoTex)!;
      const [, ponto] = /f'\((-?\d+)\)/.exec(exercicio.enunciado)!;

      const a = aTexto === '' ? 1 : Number(aTexto);
      const b = sinal === '+' ? Number(bTexto) : -Number(bTexto);
      const n = Number(nTexto);

      const numerica = derivadaNumerica((x) => (a * x + b) ** n, Number(ponto), 1e-5);
      expect(exercicio.gabarito).toBeCloseTo(numerica, 2);
    }
  });

  it('diagnostica quem esquece o fator interno', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('derivada interna')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('derivada interna'))!;

    const resultado = corrigir(geradorCadeia, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('cadeia.erro-comum');
  });

  it('diagnostica quem mantém o expoente', () => {
    const exercicio = amostra('medio', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('DIMINUIR em um')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('cadeia.regra');
  });
});

describe('outras cascas (Extremo)', () => {
  it('a derivada confere com a derivada numérica', () => {
    const outras = amostra('extremo', 160).filter((e) => !e.enunciadoTex.includes('\\right)^{'));
    expect(outras.length).toBeGreaterThan(0);

    for (const exercicio of outras) {
      const [, a, sinal, b] = /(\d+)x ([+-]) (\d+)/.exec(exercicio.enunciadoTex)!;
      const miolo = (x: number): number => Number(a) * x + (sinal === '-' ? -1 : 1) * Number(b);
      const tex = exercicio.enunciadoTex;
      const f = (x: number): number =>
        tex.includes('\\sqrt')
          ? Math.sqrt(miolo(x))
          : tex.includes('\\ln')
            ? Math.log(miolo(x))
            : tex.includes('\\sin')
              ? Math.sin(miolo(x))
              : Math.exp(miolo(x));
      const ponto = Number(/f'\((-?\d+)\)/.exec(exercicio.enunciado)![1]);
      const h = 1e-6;
      const numerica = (f(ponto + h) - f(ponto - h)) / (2 * h);

      expect(exercicio.gabarito).toBeCloseTo(numerica, 4);
    }
  });
});

describe('geradorCadeia — derivada segunda e três camadas', () => {
  const rng = criarRng(73_737);
  const lote = (nivel: Nivel) => Array.from({ length: 300 }, () => geradorCadeia.gerar(nivel, rng));
  const binomio = (tex: string) => {
    const [, a, s, b] = /\\left\((\d*)x ([+-]) (\d+)\\right\)/.exec(tex)!;
    return [Number(a || 1), (s === '+' ? 1 : -1) * Number(b)] as const;
  };

  it('a derivada segunda confere com a diferença finita', () => {
    const casos = lote('medio').filter((e) => e.id.startsWith('cadeia-segunda'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [a, b] = binomio(e.enunciadoTex);
      const n = Number(/\^\{(\d+)\}$/.exec(e.enunciadoTex)![1]);
      const p = Number(/f''\((-?\d+)\)/.exec(e.enunciado)![1]);
      const f = (x: number) => (a * x + b) ** n;
      const h = 1e-3;
      expect(e.gabarito).toBeCloseTo((f(p + h) - 2 * f(p) + f(p - h)) / (h * h), 1);
    }
  });

  it('as três camadas conferem com a derivada numérica', () => {
    const casos = lote('dificil').filter((e) => e.id.startsWith('cadeia-tres'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [a, b] = binomio(e.enunciadoTex);
      const p = Number(/f'\((-?\d+)\)/.exec(e.enunciado)![1]);
      const f = (x: number) => Math.log(1 + (a * x + b) ** 2);
      const h = 1e-6;
      expect(e.gabarito).toBeCloseTo((f(p + h) - f(p - h)) / (2 * h), 4);
    }
  });
});
