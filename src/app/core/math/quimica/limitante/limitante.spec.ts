import {
  acharLimitante,
  massaDeProduto,
  massaDeProdutoComPassos,
  massaQueSobra,
  receitasAlcancadas,
  rendimento,
  rendimentoComPassos,
} from '@core/math/quimica/limitante/limitante';

// 2 H₂ + O₂ → 2 H₂O
const H2 = { formula: 'H₂', coeficiente: 2, massaMolar: 2.02 };
const O2 = { formula: 'O₂', coeficiente: 1, massaMolar: 32.0 };
const H2O = { formula: 'H₂O', coeficiente: 2, massaMolar: 18.02 };

describe('reagente limitante', () => {
  it('a medida é mols dividido pelo coeficiente', () => {
    // 4,04 g de H₂ são 2 mol; divididos por 2, dão uma receita.
    expect(receitasAlcancadas({ participante: H2, massa: 4.04 })).toBeCloseTo(1, 6);
    // 32 g de O₂ são 1 mol; dividido por 1, dá uma receita também.
    expect(receitasAlcancadas({ participante: O2, massa: 32 })).toBeCloseTo(1, 6);
  });

  /**
   * O erro de quem está aprendendo: escolher o limitante pela massa.
   *
   * Aqui o hidrogênio é MUITO mais leve, e mesmo assim é o oxigênio que
   * limita. Pela massa, a resposta seria a oposta.
   */
  it('o mais leve não é necessariamente o limitante', () => {
    const hidrogenio = { participante: H2, massa: 10 };
    const oxigenio = { participante: O2, massa: 32 };

    const analise = acharLimitante(hidrogenio, oxigenio);

    expect(analise.limitante.participante.formula).toBe('O₂');
    expect(analise.excesso.participante.formula).toBe('H₂');
    expect(oxigenio.massa).toBeGreaterThan(hidrogenio.massa);
  });

  it('ignorar o coeficiente inverteria a resposta', () => {
    // 2 mol de H₂ e 1,5 mol de O₂: em MOLS o oxigênio é menor, mas pela razão
    // com o coeficiente é o hidrogênio que limita.
    const hidrogenio = { participante: H2, massa: 2 * H2.massaMolar };
    const oxigenio = { participante: O2, massa: 1.5 * O2.massaMolar };

    expect(acharLimitante(hidrogenio, oxigenio).limitante.participante.formula).toBe('H₂');
  });

  it('o produto sai da quantidade de receitas do limitante', () => {
    // Uma receita: 2 mol de água, 36,04 g.
    const massa = massaDeProduto(
      { participante: H2, massa: 4.04 },
      { participante: O2, massa: 32 },
      H2O,
    );

    expect(massa).toBeCloseTo(36.04, 2);
  });

  it('o excesso sobra, e o quanto se calcula', () => {
    // Oxigênio limita em uma receita; o hidrogênio consome 4,04 g dos 10.
    const sobra = massaQueSobra({ participante: H2, massa: 10 }, { participante: O2, massa: 32 });

    expect(sobra).toBeCloseTo(10 - 4.04, 2);
  });

  it('quando os dois acabam juntos, nada sobra', () => {
    const sobra = massaQueSobra({ participante: H2, massa: 4.04 }, { participante: O2, massa: 32 });

    expect(Math.abs(sobra)).toBeLessThan(1e-9);
  });

  it('a resolução nomeia o limitante e o excesso', () => {
    const { passos } = massaDeProdutoComPassos(
      { participante: H2, massa: 10 },
      { participante: O2, massa: 32 },
      H2O,
      '2\\,\\text{H}_2 + \\text{O}_2 \\to 2\\,\\text{H}_2\\text{O}',
    );

    expect(passos.length).toBe(5);
    expect(passos[3]!.descricao).toContain('O₂ é o limitante');
    expect(passos[3]!.descricao).toContain('H₂ sobra');
  });
});

describe('rendimento', () => {
  it('compara o obtido com o teto', () => {
    expect(rendimento(27, 36)).toBeCloseTo(75, 6);
  });

  it('rendimento total é 100%', () => {
    expect(rendimento(36, 36)).toBe(100);
  });

  /**
   * Acima de 100% não há reação generosa: há erro de medida ou produto
   * impuro. A função não impede o número — ela o calcula —, e é a resolução
   * que diz o que ele significa.
   */
  it('acima de 100% a conta funciona, e a resolução avisa', () => {
    const { resultado, passos } = rendimentoComPassos(40, 36, 'H₂O');

    expect(resultado).toBeGreaterThan(100);
    expect(passos[2]!.nota).toContain('produto impuro');
  });

  it('a resolução diz que o obtido vai em cima', () => {
    const { passos } = rendimentoComPassos(27, 36, 'H₂O');

    expect(passos[1]!.nota).toContain('obtido vai em cima');
  });
});
