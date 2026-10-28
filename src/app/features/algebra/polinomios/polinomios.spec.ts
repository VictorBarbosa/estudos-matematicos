import { Polinomio, dividirComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorPolinomios } from './polinomios.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(9901);
  return Array.from({ length: quantidade }, () => geradorPolinomios.gerar(nivel, rng));
}

/** Reconstrói P(x) a partir do enunciado em TeX. */
function lerPolinomio(enunciadoTex: string): Polinomio {
  const graus: Record<number, number> = {};
  const corpo = enunciadoTex.replace('P(x) = ', '');

  for (const bruto of corpo.split(/(?=[+-])/)) {
    const termo = bruto.replace(/\s/g, '');
    if (termo === '') {
      continue;
    }

    const comExpoente = /^([+-]?\d*)x\^\{(\d+)\}$/.exec(termo);
    const linear = /^([+-]?\d*)x$/.exec(termo);
    const constante = /^([+-]?\d+)$/.exec(termo);

    if (comExpoente) {
      graus[Number(comExpoente[2])] = coeficiente(comExpoente[1]!);
    } else if (linear) {
      graus[1] = coeficiente(linear[1]!);
    } else if (constante) {
      graus[0] = Number(constante[1]);
    }
  }

  return Polinomio.deGraus(graus);
}

function coeficiente(texto: string): number {
  return texto === '' || texto === '+' ? 1 : texto === '-' ? -1 : Number(texto);
}

describe('geradorPolinomios', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThanOrEqual(1e-6);
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

  it('o resto pedido é P(a), pelo teorema do resto', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.startsWith('Qual é o resto'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const p = lerPolinomio(exercicio.enunciadoTex);
      const [, sinal, modulo] = /\(x ([+-]) (\d+)\)/.exec(exercicio.enunciado)!;
      const a = sinal === '-' ? Number(modulo) : -Number(modulo);

      expect(exercicio.gabarito).toBeCloseTo(p.avaliar(a), 9);

      // E confere com a divisão longa, que é o caminho sem atalho.
      const { resto } = dividirComPassos(p, Polinomio.de(-a, 1)).resultado;
      expect(resto.avaliar(0)).toBeCloseTo(exercicio.gabarito, 9);
    }
  });

  it('o grau do quociente é a diferença dos graus', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('grau do quociente'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, grauP, grauD] = /grau (\d+) por um de grau (\d+)/.exec(exercicio.enunciado)!;
      expect(exercicio.gabarito).toBe(Number(grauP) - Number(grauD));
    }
  });

  it('a raiz pedida anula o polinômio e é a menor', () => {
    const exercicios = amostra('dificil', 120).filter((e) =>
      e.enunciado.includes('Qual é a menor delas'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const p = lerPolinomio(exercicio.enunciadoTex);

      expect(p.avaliar(exercicio.gabarito)).toBeCloseTo(0, 8);

      // Nenhum valor menor, num passo fino, também anula.
      for (let x = exercicio.gabarito - 5; x < exercicio.gabarito - 1e-6; x += 0.25) {
        expect(Math.abs(p.avaliar(x))).toBeGreaterThan(1e-8);
      }
    }
  });

  it('o coeficiente pedido é o do quociente de verdade', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('No quociente'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const p = lerPolinomio(exercicio.enunciadoTex);
      const [, sinal, modulo] = /\(x ([+-]) (\d+)\)/.exec(exercicio.enunciado)!;
      const a = sinal === '-' ? Number(modulo) : -Number(modulo);

      const { quociente } = dividirComPassos(p, Polinomio.de(-a, 1)).resultado;
      const grau = /termo constante/.test(exercicio.enunciado)
        ? 0
        : /coeficiente de x\^(\d+)/.exec(exercicio.enunciado)
          ? Number(/coeficiente de x\^(\d+)/.exec(exercicio.enunciado)![1])
          : 1;

      expect(exercicio.gabarito).toBeCloseTo(quociente.coeficiente(grau), 9);
    }
  });

  it('diagnostica quem soma os graus em vez de subtrair', () => {
    const exercicio = amostra('facil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('MULTIPLICAÇÃO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('MULTIPLICAÇÃO'))!;
    const resultado = corrigir(geradorPolinomios, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('polinomios.estrutura');
  });

  it('diagnostica quem troca o sinal de a no teorema do resto', () => {
    const exercicio = amostra('medio', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('sinal de a ficou trocado')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('sinal de a ficou trocado'),
    )!;

    const resultado = corrigir(geradorPolinomios, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('polinomios.raizes');
  });

  it('aceita fração como resposta, para raízes como 1/2', () => {
    expect(geradorPolinomios.analisar('1/2')).toBe(0.5);
    expect(geradorPolinomios.analisar('-3/4')).toBe(-0.75);
    expect(geradorPolinomios.analisar('-6')).toBe(-6);
    expect(geradorPolinomios.analisar('0,5')).toBe(0.5);
    expect(geradorPolinomios.analisar('meio')).toBeNull();
  });
});
