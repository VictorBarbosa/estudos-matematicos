import {
  FAMILIAS_IMPLICITAS,
  curvaImplicitaParaTex,
  curvaPeloPonto,
  derivadaImplicitaComPassos,
  derivadaImplicitaNoPonto,
  pontoEstaNaCurva,
  retaTangenteTex,
  somaParaTex,
  tangenteEhVertical,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir, formasDoGabarito } from '@core/treino/models/treino.model';
import { geradorDerivacaoImplicita } from '@features/calculo-1/derivacao-implicita/derivacao-implicita.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(16_180);
  return Array.from({ length: quantidade }, () => geradorDerivacaoImplicita.gerar(nivel, rng));
}

describe('geradorDerivacaoImplicita', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito existe e é aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciadoTex).toBe(true);

        for (const forma of formasDoGabarito(geradorDerivacaoImplicita, exercicio.gabarito)) {
          expect(
            corrigir(geradorDerivacaoImplicita, exercicio, forma).veredito,
            `${forma} em ${exercicio.enunciadoTex}`,
          ).toBe('correto');
        }
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorDerivacaoImplicita.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciadoTex,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o ponto do enunciado está sempre sobre a curva', () => {
    // É a propriedade que o tópico inteiro depende: a curva é montada A PARTIR
    // do ponto, e não o contrário, justamente para que isso nunca falhe.
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 60)) {
        const [, x, y] = /\((-?\d+), (-?\d+)\)/.exec(exercicio.enunciado)!;
        const constante = Number(
          /= (-?\d+)$/.exec(exercicio.enunciadoTex.replace(/\{,\}/g, '.'))![1],
        );

        expect(Number.isFinite(constante), exercicio.enunciadoTex).toBe(true);
        expect(Number.isInteger(Number(x))).toBe(true);
        expect(Number.isInteger(Number(y))).toBe(true);
      }
    }
  });

  it('o gabarito sempre tem uma escrita em fração', () => {
    for (const exercicio of amostra('dificil', 120)) {
      const formas = formasDoGabarito(geradorDerivacaoImplicita, exercicio.gabarito);
      expect(formas.length, exercicio.enunciadoTex).toBeGreaterThan(0);
      expect(
        formas.some((forma) => /^-?\d+(\/\d+)?$/.test(forma)),
        formas.join(' · '),
      ).toBe(true);
    }
  });

  it('o Fácil só traz cônicas de dois termos', () => {
    for (const exercicio of amostra('facil', 120)) {
      expect(exercicio.enunciadoTex).not.toContain('xy');
    }
  });

  it('diagnostica quem inverte o sinal ao isolar', () => {
    const exercicio = amostra('facil', 120)[0]!;
    const resultado = corrigir(
      geradorDerivacaoImplicita,
      exercicio,
      geradorDerivacaoImplicita.formatar(-exercicio.gabarito),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('implicita.isolamento');
  });
});

/**
 * O motor da derivação implícita.
 *
 * A ideia é tratar a equação como soma de monômios e separar o que acompanha
 * `dy/dx` do que não acompanha — a partir daí, isolar é aritmética.
 */
describe('derivação implícita', () => {
  const circunferencia = {
    termos: [
      { coeficiente: 1, grauX: 2, grauY: 0 },
      { coeficiente: 1, grauX: 0, grauY: 2 },
    ],
    constante: 25,
    nome: 'circunferência',
  };

  it('a circunferência tem derivada menos x sobre y', () => {
    expect(derivadaImplicitaNoPonto(circunferencia, 3, 4)).toBeCloseTo(-3 / 4, 12);
    expect(derivadaImplicitaNoPonto(circunferencia, -3, 4)).toBeCloseTo(3 / 4, 12);
  });

  it('a tangente é perpendicular ao raio', () => {
    const inclinacaoDoRaio = 4 / 3;
    expect(derivadaImplicitaNoPonto(circunferencia, 3, 4) * inclinacaoDoRaio).toBeCloseTo(-1, 12);
  });

  it('onde y zera, a tangente é vertical', () => {
    expect(tangenteEhVertical(circunferencia, 5, 0)).toBe(true);
    expect(tangenteEhVertical(circunferencia, 3, 4)).toBe(false);
    expect(Number.isNaN(derivadaImplicitaNoPonto(circunferencia, 5, 0))).toBe(true);
  });

  it('a reta tangente passa pelo ponto', () => {
    expect(retaTangenteTex(circunferencia, 3, 4)).toBe('y = -0{,}75x + 6{,}25');
    expect(retaTangenteTex(circunferencia, 5, 0)).toBe('x = 5');
  });

  it('a curva é montada para passar pelo ponto', () => {
    for (const familia of FAMILIAS_IMPLICITAS) {
      const curva = curvaPeloPonto(familia, 3, 2, 2, 5);
      expect(pontoEstaNaCurva(curva, 2, 5), familia.nome).toBe(true);
    }
  });

  it('o termo misto exige a regra do produto nos dois lados', () => {
    // xy = 12: a derivada de xy é y + x·y', de modo que y' = −y/x.
    const hiperbole = {
      termos: [{ coeficiente: 1, grauX: 1, grauY: 1 }],
      constante: 12,
      nome: 'hipérbole equilátera',
    };

    expect(derivadaImplicitaNoPonto(hiperbole, 3, 4)).toBeCloseTo(-4 / 3, 12);
  });

  it('a resolução passa por derivar, agrupar e só então isolar', () => {
    const { resultado, passos } = derivadaImplicitaComPassos(circunferencia, 3, 4);

    expect(resultado).toBeCloseTo(-0.75, 12);
    expect(passos).toHaveLength(4);
    expect(passos[1]!.tex).toContain('\\frac{dy}{dx} = 0');
    expect(passos[2]!.descricao).toContain('isolamos');
    expect(passos[3]!.tex).toContain('-0{,}75');
  });

  it('quando a fração já é inteira, o passo não repete o mesmo número duas vezes', () => {
    const hiperbole = {
      termos: [{ coeficiente: 1, grauX: 1, grauY: 1 }],
      constante: 12,
      nome: 'hipérbole equilátera',
    };
    const { passos } = derivadaImplicitaComPassos(hiperbole, 2, 6);

    expect(passos[3]!.tex).toBe('\\frac{dy}{dx} = -\\frac{6}{2} = -3');
  });

  it('a soma de monômios é escrita com os sinais arrumados', () => {
    expect(somaParaTex(circunferencia.termos)).toBe('x^{2} + y^{2}');
    expect(
      somaParaTex([
        { coeficiente: 2, grauX: 2, grauY: 0 },
        { coeficiente: -3, grauX: 0, grauY: 2 },
      ]),
    ).toBe('2x^{2} - 3y^{2}');
    expect(somaParaTex([])).toBe('0');
  });

  it('a equação sai pronta para o enunciado', () => {
    expect(curvaImplicitaParaTex(circunferencia)).toBe('x^{2} + y^{2} = 25');
  });
});
