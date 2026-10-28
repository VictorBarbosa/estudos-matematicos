import { Polinomio } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorTaxa } from './taxa-de-variacao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8814);
  return Array.from({ length: quantidade }, () => geradorTaxa.gerar(nivel, rng));
}

/** Recupera s(t) a partir do enunciado em TeX, para conferir o gabarito. */
function coeficientes(enunciadoTex: string): Polinomio {
  const graus: Record<number, number> = {};

  for (const termo of enunciadoTex.replace('s(t) = ', '').split(/(?=[+-])/)) {
    const limpo = termo.replace(/\s/g, '');
    if (limpo === '') {
      continue;
    }

    const comExpoente = /^([+-]?\d*)t\^\{(\d+)\}$/.exec(limpo);
    const linear = /^([+-]?\d*)t$/.exec(limpo);
    const constante = /^([+-]?\d+)$/.exec(limpo);

    if (comExpoente) {
      graus[Number(comExpoente[2])] = numero(comExpoente[1]!);
    } else if (linear) {
      graus[1] = numero(linear[1]!);
    } else if (constante) {
      graus[0] = Number(constante[1]);
    }
  }

  return Polinomio.deGraus(graus);
}

function numero(texto: string): number {
  return texto === '' || texto === '+' ? 1 : texto === '-' ? -1 : Number(texto);
}

describe('geradorTaxa', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.05);
        }
      }
    });

    it(`no nível ${nivel}, todo exercício traz resolução e conceitos`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(2);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
        expect(exercicio.resolucao.resultado).toBe(exercicio.gabarito);
      }
    });
  }

  it('a velocidade pedida é a derivada da posição no instante', () => {
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciado.includes('velocidade instantânea'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const s = coeficientes(exercicio.enunciadoTex);
      const t = Number(/t = (\d+) s/.exec(exercicio.enunciado)![1]);

      expect(exercicio.gabarito).toBeCloseTo(s.derivar().avaliar(t), 9);
    }
  });

  it('a aceleração pedida é a segunda derivada', () => {
    const exercicios = amostra('medio', 120).filter((e) => e.enunciado.includes('aceleração'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const s = coeficientes(exercicio.enunciadoTex);
      const t = Number(/t = (\d+) s/.exec(exercicio.enunciado)![1]);

      expect(exercicio.gabarito).toBeCloseTo(s.derivar().derivar().avaliar(t), 9);
    }
  });

  it('a velocidade média é a inclinação da secante', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('velocidade média'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const s = coeficientes(exercicio.enunciadoTex);
      const [, t0, t1] = /entre t = (\d+) s e t = (\d+) s/.exec(exercicio.enunciado)!;
      const esperado = (s.avaliar(Number(t1)) - s.avaliar(Number(t0))) / (Number(t1) - Number(t0));

      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);
    }
  });

  it('no instante da parada, a velocidade é nula', () => {
    const exercicios = amostra('dificil', 120).filter((e) => e.enunciado.includes('ele para'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const s = coeficientes(exercicio.enunciadoTex);

      expect(s.derivar().avaliar(exercicio.gabarito)).toBeCloseTo(0, 9);
      // E é mesmo a PRIMEIRA parada: antes dela a velocidade não zera.
      for (let t = 0; t < exercicio.gabarito - 0.01; t += 0.05) {
        expect(Math.abs(s.derivar().avaliar(t))).toBeGreaterThan(1e-6);
      }
    }
  });

  it('diagnostica quem responde a posição no lugar da velocidade', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor da POSIÇÃO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('valor da POSIÇÃO'),
    )!;

    const resultado = corrigir(geradorTaxa, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('valor da POSIÇÃO');
    expect(resultado.conceitoAssociado).toBe('taxa.instantanea');
  });

  it('aceita vírgula decimal e sinal negativo', () => {
    expect(geradorTaxa.analisar('-2,5')).toBe(-2.5);
    expect(geradorTaxa.analisar(' 7 ')).toBe(7);
    expect(geradorTaxa.analisar('três')).toBeNull();
  });
});
