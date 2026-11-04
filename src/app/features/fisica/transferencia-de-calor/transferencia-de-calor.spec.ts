import {
  STEFAN_BOLTZMANN,
  ZERO_CELSIUS,
  calorSensivelComPassos,
  condutividadeDe,
  conducaoComPassos,
  conveccaoComPassos,
  equilibrioRadiativoComPassos,
  equilibrioTermicoComPassos,
  paraKelvin,
  radiacaoComPassos,
  resistenciaTermicaComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorTransferenciaDeCalor } from '@features/fisica/transferencia-de-calor/transferencia-de-calor.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(55_555);
  return Array.from({ length: quantidade }, () => geradorTransferenciaDeCalor.gerar(nivel, rng));
}

describe('geradorTransferenciaDeCalor', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorTransferenciaDeCalor.formatar(exercicio.gabarito);
        expect(corrigir(geradorTransferenciaDeCalor, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorTransferenciaDeCalor.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Difícil chega à radiação e ao equilíbrio no vácuo', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('termica.radiacao')).toBe(true);
    expect(conceitos.has('termica.vacuo')).toBe(true);
  });

  it('todo exercício de radiação oferece a armadilha do Celsius', () => {
    // É o erro fatal do tópico: com a quarta potência, a escala errada não
    // desloca o resultado, ela o destrói.
    const radiativos = amostra('dificil', 250).filter((exercicio) =>
      exercicio.enunciado.includes('potência irradiada'),
    );

    expect(radiativos.length).toBeGreaterThan(0);
    for (const exercicio of radiativos) {
      expect(
        exercicio.armadilhas.some((a) => a.conceito === 'termica.kelvin'),
        exercicio.enunciado,
      ).toBe(true);
    }
  });

  it('diagnostica quem multiplica pela espessura em vez de dividir', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('espessura DIVIDE')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('espessura DIVIDE'))!;
    const resultado = corrigir(
      geradorTransferenciaDeCalor,
      exercicio,
      geradorTransferenciaDeCalor.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('termica.conducao');
  });
});

/**
 * O motor térmico.
 *
 * As três leis são conferidas no que elas têm de característico: a linearidade
 * das duas primeiras e a quarta potência da terceira.
 */
describe('transferência de calor', () => {
  it('a condutividade separa condutores de isolantes por ordens de grandeza', () => {
    expect(condutividadeDe('cobre')! / condutividadeDe('lã de vidro')!).toBeGreaterThan(1000);
  });

  it('dobrar a espessura reduz o fluxo à metade', () => {
    const fina = conducaoComPassos(1, 1, 10, 0.1).resultado;
    const grossa = conducaoComPassos(1, 1, 10, 0.2).resultado;

    expect(grossa).toBeCloseTo(fina / 2, 10);
  });

  it('dobrar a área dobra o fluxo', () => {
    expect(conducaoComPassos(1, 2, 10, 0.1).resultado).toBeCloseTo(
      2 * conducaoComPassos(1, 1, 10, 0.1).resultado,
      10,
    );
  });

  it('a resistência térmica é o inverso da condutância', () => {
    const { resultado } = resistenciaTermicaComPassos(0.2, 0.8, 1);

    expect(resultado).toBeCloseTo(0.25, 10);
    expect(1 / resultado).toBeCloseTo(4, 10);
  });

  it('a convecção é linear na diferença de temperatura', () => {
    expect(conveccaoComPassos(10, 1, 20).resultado).toBeCloseTo(
      2 * conveccaoComPassos(10, 1, 10).resultado,
      10,
    );
  });

  it('a radiação vai com a quarta potência', () => {
    const fria = radiacaoComPassos(1, 1, 300).resultado;
    const quente = radiacaoComPassos(1, 1, 600).resultado;

    expect(quente / fria).toBeCloseTo(16, 6);
  });

  it('um corpo negro a 300 K emite cerca de 459 W por metro quadrado', () => {
    expect(radiacaoComPassos(1, 1, 300).resultado).toBeCloseTo(STEFAN_BOLTZMANN * 300 ** 4, 10);
    expect(radiacaoComPassos(1, 1, 300).resultado).toBeGreaterThan(450);
  });

  it('o equilíbrio radiativo desfaz a quarta potência', () => {
    const potencia = radiacaoComPassos(0.9, 2, 350).resultado;
    const { resultado } = equilibrioRadiativoComPassos(potencia, 0.9, 2);

    expect(resultado).toBeCloseTo(350, 6);
  });

  it('dobrar a área baixa a temperatura só pela raiz quarta de dois', () => {
    const pequena = equilibrioRadiativoComPassos(500, 0.9, 1).resultado;
    const grande = equilibrioRadiativoComPassos(500, 0.9, 2).resultado;

    expect(pequena / grande).toBeCloseTo(2 ** 0.25, 8);
  });

  it('a conversão para kelvin soma o zero da escala', () => {
    expect(paraKelvin(27)).toBeCloseTo(300.15, 10);
    expect(paraKelvin(0)).toBe(ZERO_CELSIUS);
  });

  it('a água exige quase dez vezes mais energia que o ferro', () => {
    const agua = calorSensivelComPassos(1, 4186, 10).resultado;
    const ferro = calorSensivelComPassos(1, 450, 10).resultado;

    expect(agua / ferro).toBeCloseTo(4186 / 450, 10);
  });

  it('a temperatura de equilíbrio pende para a maior capacidade térmica', () => {
    const { resultado } = equilibrioTermicoComPassos(1, 4186, 20, 1, 450, 100);

    expect(resultado).toBeGreaterThan(20);
    expect(resultado).toBeLessThan(40);
  });

  it('com capacidades iguais, o equilíbrio é a média simples', () => {
    const { resultado } = equilibrioTermicoComPassos(1, 1000, 20, 1, 1000, 80);

    expect(resultado).toBeCloseTo(50, 10);
  });
});
