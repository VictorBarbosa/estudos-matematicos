import { resumirAmostra } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorIncerteza } from './estatistica-e-incerteza.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(7777);
  return Array.from({ length: quantidade }, () => geradorIncerteza.gerar(nivel, rng));
}

/** Lê a lista de medidas do enunciado. */
function medidasDe(enunciado: string): number[] {
  return /medidas (.*?), qual/
    .exec(enunciado)![1]!
    .split('; ')
    .map(Number);
}

describe('geradorIncerteza', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorIncerteza.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });

    it(`no nível ${nivel}, todo exercício traz resolução e conceitos`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
        expect(exercicio.resolucao.resultado).toBe(exercicio.gabarito);
      }
    });
  }

  it('a média é a soma dividida pela quantidade', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('qual é a média'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const medidas = medidasDe(exercicio.enunciado);
      const esperado = medidas.reduce((total, valor) => total + valor, 0) / medidas.length;

      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);
    }
  });

  it('a mediana está entre o menor e o maior valor', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('a mediana'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const medidas = medidasDe(exercicio.enunciado);

      expect(exercicio.gabarito).toBeGreaterThanOrEqual(Math.min(...medidas));
      expect(exercicio.gabarito).toBeLessThanOrEqual(Math.max(...medidas));
      expect(exercicio.gabarito).toBeCloseTo(resumirAmostra(medidas).mediana, 9);
    }
  });

  it('o desvio padrão é positivo e menor que a amplitude', () => {
    // "desvio padrão amostral" distingue este caso do rótulo da incerteza da
    // média, que também menciona desvio padrão.
    const exercicios = amostra('medio', 120).filter((e) =>
      e.enunciado.includes('o desvio padrão amostral'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const medidas = medidasDe(exercicio.enunciado);
      const resumo = resumirAmostra(medidas);

      expect(exercicio.gabarito).toBeCloseTo(resumo.desvioPadrao, 9);
      expect(exercicio.gabarito).toBeGreaterThan(0);
      expect(exercicio.gabarito).toBeLessThan(resumo.amplitude);
    }
  });

  it('a incerteza da média é menor que o desvio padrão', () => {
    const exercicios = amostra('medio', 120).filter((e) =>
      e.enunciado.includes('incerteza da média'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const medidas = medidasDe(exercicio.enunciado);
      const resumo = resumirAmostra(medidas);

      expect(exercicio.gabarito).toBeCloseTo(resumo.incertezaDaMedia, 9);
      expect(exercicio.gabarito).toBeLessThan(resumo.desvioPadrao);
    }
  });

  it('a incerteza da soma é a combinação em quadratura', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('Somando os dois'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, a, b] = /\\sigma_1 = ([\d{},]+) \\qquad \\sigma_2 = ([\d{},]+)/.exec(
        exercicio.enunciadoTex,
      )!;

      const s1 = Number(a.replace('{,}', '.'));
      const s2 = Number(b.replace('{,}', '.'));

      expect(exercicio.gabarito).toBeCloseTo(Math.hypot(s1, s2), 9);
      // Sempre menor que a soma direta, e nunca menor que a maior parcela.
      expect(exercicio.gabarito).toBeLessThan(s1 + s2);
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(Math.max(s1, s2));
    }
  });

  it('a incerteza da área combina as relativas', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('incerteza da área'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, base, sb, altura, sh] =
        /b = (\d+) \\pm ([\d{},]+) \\qquad h = (\d+) \\pm ([\d{},]+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const b = Number(base);
      const h = Number(altura);
      const incertezaB = Number(sb.replace('{,}', '.'));
      const incertezaH = Number(sh.replace('{,}', '.'));

      const relativa = Math.hypot(incertezaB / b, incertezaH / h);
      expect(exercicio.gabarito).toBeCloseTo(b * h * relativa, 6);
    }
  });

  it('a inclinação ajustada recupera o coeficiente dos pontos', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('inclinação'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const pontos = [...exercicio.enunciado.matchAll(/\((\d+); (-?\d+)\)/g)].map((m) => ({
        x: Number(m[1]),
        y: Number(m[2]),
      }));

      expect(pontos.length).toBeGreaterThan(1);

      // Pontos colineares: a inclinação é Δy/Δx entre quaisquer dois.
      const esperado =
        (pontos[1]!.y - pontos[0]!.y) / (pontos[1]!.x - pontos[0]!.x);

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);
    }
  });

  it('diagnostica quem soma incertezas diretamente', () => {
    const exercicio = amostra('medio', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('erram para o mesmo')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('erram para o mesmo'),
    )!;

    const resultado = corrigir(geradorIncerteza, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('incerteza.propagacao');
  });

  it('diagnostica quem confunde desvio padrão com incerteza da média', () => {
    const exercicio = amostra('medio', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('divide por √n')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('divide por √n'))!;
    const resultado = corrigir(geradorIncerteza, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('incerteza.dispersao');
  });

  it('aceita decimal com vírgula', () => {
    expect(geradorIncerteza.analisar('2,05')).toBe(2.05);
    expect(geradorIncerteza.analisar('0.36')).toBe(0.36);
    expect(geradorIncerteza.analisar('aproximado')).toBeNull();
  });
});
