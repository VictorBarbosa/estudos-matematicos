import { arranjosComPassos, combinacoes, fatorial } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorCombinatoria } from './analise-combinatoria.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(9182);
  return Array.from({ length: quantidade }, () => geradorCombinatoria.gerar(nivel, rng));
}

describe('geradorCombinatoria', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta).not.toBe(exercicio.gabarito);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito é um inteiro positivo`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
        expect(exercicio.gabarito).toBeGreaterThan(0);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
      }
    });
  }

  it('o princípio multiplicativo multiplica as opções', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('trajes'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, a, b, c] = /(\d+) \\times (\d+) \\times (\d+)/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBe(Number(a) * Number(b) * Number(c));
    }
  });

  it('o arranjo é maior que a combinação correspondente', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('fila'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, n, p] = /A_\{(\d+),(\d+)\}/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBe(arranjosComPassos(Number(n), Number(p)).resultado);
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(combinacoes(Number(n), Number(p)));
    }
  });

  it('a combinação confere e é simétrica', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('equipe'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, n, p] = /C_\{(\d+),(\d+)\}/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBe(combinacoes(Number(n), Number(p)));
      expect(exercicio.gabarito).toBe(combinacoes(Number(n), Number(n) - Number(p)));
    }
  });

  it('o anagrama de palavra com repetição é menor que n!', () => {
    const exercicios = amostra('dificil', 150).filter((e) => e.enunciado.includes('anagramas'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const palavra = /\\text\{([A-Z]+)\}/.exec(exercicio.enunciadoTex)![1]!;
      const total = fatorial(palavra.length);

      const temRepetida = new Set(palavra).size < palavra.length;

      if (temRepetida) {
        expect(exercicio.gabarito).toBeLessThan(total);
      } else {
        expect(exercicio.gabarito).toBe(total);
      }

      // O total de anagramas divide n! exatamente.
      expect(total % exercicio.gabarito).toBe(0);
    }
  });

  it('a comissão mista multiplica as combinações de cada grupo', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('comissão'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, n1, p1, n2, p2] = /C_\{(\d+),(\d+)\} \\cdot C_\{(\d+),(\d+)\}/.exec(
        exercicio.enunciadoTex,
      )!;

      expect(exercicio.gabarito).toBe(
        combinacoes(Number(n1), Number(p1)) * combinacoes(Number(n2), Number(p2)),
      );
    }
  });

  it('diagnostica quem usa arranjo onde a ordem não importa', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Esse é o ARRANJO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('Esse é o ARRANJO'),
    )!;

    const resultado = corrigir(geradorCombinatoria, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('combinatoria.combinacao');
  });

  it('diagnostica quem soma em vez de multiplicar', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Somar contaria')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('Somar contaria'))!;
    const resultado = corrigir(geradorCombinatoria, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('combinatoria.multiplicativo');
  });

  it('aceita separador de milhar e recusa decimais', () => {
    expect(geradorCombinatoria.analisar('3.628.800')).toBe(3628800);
    expect(geradorCombinatoria.analisar(' 120 ')).toBe(120);
    expect(geradorCombinatoria.analisar('12,5')).toBeNull();
    expect(geradorCombinatoria.analisar('muitos')).toBeNull();
  });
});
