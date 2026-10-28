import { moduloComplexo, multiplicarComplexosComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorComplexos } from './numeros-complexos.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2024);
  return Array.from({ length: quantidade }, () => geradorComplexos.gerar(nivel, rng));
}

/** Lê um complexo escrito como "3 + 4i", "-i", "5". */
function lerComplexo(texto: string): { real: number; imaginario: number } {
  const limpo = texto.trim();

  const completo = /^(-?\d+) ([+-]) (\d*)i$/.exec(limpo);
  if (completo) {
    const sinal = completo[2] === '-' ? -1 : 1;
    const modulo = completo[3] === '' ? 1 : Number(completo[3]);
    return { real: Number(completo[1]), imaginario: sinal * modulo };
  }

  const soImaginario = /^(-?\d*)i$/.exec(limpo);
  if (soImaginario) {
    const bruto = soImaginario[1];
    const imaginario = bruto === '' ? 1 : bruto === '-' ? -1 : Number(bruto);
    return { real: 0, imaginario };
  }

  return { real: Number(limpo), imaginario: 0 };
}

describe('geradorComplexos', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorComplexos.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
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

  it('o módulo é positivo e confere com Pitágoras', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('módulo de'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const z = lerComplexo(exercicio.enunciadoTex.replace('z = ', ''));

      expect(exercicio.gabarito).toBeGreaterThan(0);
      expect(exercicio.gabarito).toBeCloseTo(moduloComplexo(z), 9);
    }
  });

  it('as partes do produto conferem com a distributiva e i² = −1', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('Multiplicando'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, primeiro, segundo] =
        /z_1 = (.*?) \\qquad z_2 = (.*)/.exec(exercicio.enunciadoTex)!;

      const a = lerComplexo(primeiro!);
      const b = lerComplexo(segundo!);
      const { resultado } = multiplicarComplexosComPassos(a, b);

      const esperado = exercicio.enunciado.includes('parte REAL')
        ? resultado.real
        : resultado.imaginario;

      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);
    }
  });

  it('o argumento fica entre 0 e 360 graus', () => {
    const exercicios = amostra('dificil', 150).filter((e) => e.enunciado.includes('argumento de'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(0);
      expect(exercicio.gabarito).toBeLessThan(360);
    }
  });

  it('as potências de i só assumem parte real 1, 0 ou −1', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('parte real de i^'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const expoente = Number(/i\^\{(\d+)\}/.exec(exercicio.enunciadoTex)![1]);
      const resto = expoente % 4;
      const esperado = resto === 0 ? 1 : resto === 2 ? -1 : 0;

      expect(exercicio.gabarito).toBe(esperado);
      // Zero negativo seria exibido como "-0" para o aluno.
      expect(Object.is(exercicio.gabarito, -0)).toBe(false);
    }
  });

  it('o quociente confere com a multiplicação pelo conjugado', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('Dividindo'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, numerador, denominador] = /\\frac\{(.*?)\}\{(.*?)\}/.exec(
        exercicio.enunciadoTex,
      )!;

      const a = lerComplexo(numerador!);
      const b = lerComplexo(denominador!);
      const modulo2 = b.real ** 2 + b.imaginario ** 2;

      expect(exercicio.gabarito).toBeCloseTo(
        (a.real * b.real + a.imaginario * b.imaginario) / modulo2,
        6,
      );
    }
  });

  it('diagnostica quem soma as partes para achar o módulo', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('perpendiculares no plano')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('perpendiculares no plano'),
    )!;

    const resultado = corrigir(geradorComplexos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('complexos.plano');
  });

  it('diagnostica quem esquece que i² = −1', () => {
    const exercicio = amostra('medio', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('i² = −1')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('i² = −1'))!;
    const resultado = corrigir(geradorComplexos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('complexos.multiplicacao');
  });

  it('aceita graus, negativos e frações', () => {
    expect(geradorComplexos.analisar('135°')).toBe(135);
    expect(geradorComplexos.analisar('-5')).toBe(-5);
    expect(geradorComplexos.analisar('1/2')).toBe(0.5);
    expect(geradorComplexos.analisar('i')).toBeNull();
  });
});
