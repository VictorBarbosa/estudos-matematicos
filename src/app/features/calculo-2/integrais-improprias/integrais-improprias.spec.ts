import {
  arcotangenteNoInfinitoComPassos,
  comparacaoComPassos,
  criterioDaPotencia,
  exponencialNoInfinitoComPassos,
  integrandoPotenciaTex,
  potenciaNaOrigemComPassos,
  potenciaNoInfinitoComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorIntegraisImproprias } from '@features/calculo-2/integrais-improprias/integrais-improprias.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(99_173);
  return Array.from({ length: quantidade }, () => geradorIntegraisImproprias.gerar(nivel, rng));
}

describe('geradorIntegraisImproprias', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        const exibido = geradorIntegraisImproprias.formatar(exercicio.gabarito);
        expect(corrigir(geradorIntegraisImproprias, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorIntegraisImproprias.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciadoTex,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('"diverge" e "divergente" valem a mesma coisa', () => {
    const divergente = amostra('medio', 200).find(
      (exercicio) => exercicio.gabarito.tipo === 'diverge',
    )!;

    for (const escrita of ['diverge', 'divergente', 'DIVERGE', ' infinito ', '∞']) {
      expect(corrigir(geradorIntegraisImproprias, divergente, escrita).veredito, escrita).toBe(
        'correto',
      );
    }
  });

  it('dizer apenas "converge" não vale quando o exercício pede o valor', () => {
    // É o ponto do tópico: convergir é um fato, o valor é outra pergunta.
    const comValor = amostra('facil', 200).find(
      (exercicio) => exercicio.gabarito.tipo === 'valor',
    )!;

    const resultado = corrigir(geradorIntegraisImproprias, comValor, 'converge');
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico ?? '').toContain('pede o valor');
  });

  it('um número não vale quando o exercício pede só o veredito', () => {
    const comparacao = amostra('dificil', 250).find(
      (exercicio) => exercicio.gabarito.tipo === 'converge',
    )!;

    expect(comparacao).toBeDefined();
    expect(corrigir(geradorIntegraisImproprias, comparacao, '1').veredito).toBe('incorreto');
    expect(corrigir(geradorIntegraisImproprias, comparacao, 'converge').veredito).toBe('correto');
  });

  it('o Fácil mistura casos que convergem e casos que divergem', () => {
    const vereditos = new Set(amostra('facil', 200).map((e) => e.gabarito.tipo));

    expect(vereditos.has('valor')).toBe(true);
    expect(vereditos.has('diverge')).toBe(true);
  });

  it('o Difícil chega ao teste da comparação', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('improprias.comparacao')).toBe(true);
  });
});

/**
 * O motor das integrais impróprias.
 *
 * O critério da potência é o resultado que o tópico existe para instalar, e
 * ele é conferido nos dois lados: no infinito e na origem.
 */
describe('integrais impróprias', () => {
  it('no infinito, converge quando o expoente passa de 1', () => {
    expect(criterioDaPotencia({ num: 2, den: 1 }, false).converge).toBe(true);
    expect(criterioDaPotencia({ num: 1, den: 1 }, false).converge).toBe(false);
    expect(criterioDaPotencia({ num: 1, den: 2 }, false).converge).toBe(false);
  });

  it('na origem, o critério se inverte', () => {
    expect(criterioDaPotencia({ num: 1, den: 2 }, true).converge).toBe(true);
    expect(criterioDaPotencia({ num: 1, den: 1 }, true).converge).toBe(false);
    expect(criterioDaPotencia({ num: 2, den: 1 }, true).converge).toBe(false);
  });

  it('o expoente 1 perde dos dois lados — é a fronteira', () => {
    expect(criterioDaPotencia({ num: 1, den: 1 }, false).converge).toBe(false);
    expect(criterioDaPotencia({ num: 1, den: 1 }, true).converge).toBe(false);
  });

  it('a integral de 1 sobre x ao quadrado, de 1 ao infinito, vale 1', () => {
    const { resultado } = potenciaNoInfinitoComPassos(1, { num: 2, den: 1 });

    expect(resultado.converge).toBe(true);
    expect(resultado.valor).toBeCloseTo(1, 12);
  });

  it('a mesma integral com expoente 1 diverge', () => {
    expect(potenciaNoInfinitoComPassos(1, { num: 1, den: 1 }).resultado.converge).toBe(false);
  });

  it('a integral da raiz invertida, de 0 a 1, vale 2', () => {
    const { resultado } = potenciaNaOrigemComPassos(1, { num: 1, den: 2 });

    expect(resultado.converge).toBe(true);
    expect(resultado.valor).toBeCloseTo(2, 12);
  });

  it('o valor confere com a integração numérica', () => {
    // Conferência independente: soma de Riemann até uma borda bem distante.
    const p = { num: 3, den: 1 };
    const { resultado } = potenciaNoInfinitoComPassos(2, p);

    let soma = 0;
    const passo = 0.0005;
    for (let x = 2; x < 400; x += passo) {
      soma += (x + passo / 2) ** -3 * passo;
    }

    expect(resultado.valor).toBeCloseTo(soma, 4);
  });

  it('a exponencial converge para qualquer fator positivo', () => {
    for (const k of [0.1, 1, 5]) {
      const { resultado } = exponencialNoInfinitoComPassos(0, k);
      expect(resultado.converge).toBe(true);
      expect(resultado.valor).toBeCloseTo(1 / k, 10);
    }
  });

  it('o arco-tangente converge porque a primitiva é limitada', () => {
    expect(arcotangenteNoInfinitoComPassos(0).resultado.valor).toBeCloseTo(Math.PI / 2, 12);
    expect(arcotangenteNoInfinitoComPassos(1).resultado.valor).toBeCloseTo(Math.PI / 4, 12);
  });

  it('a comparação dá o veredito nos dois sentidos', () => {
    const converge = comparacaoComPassos('menor', 'e^{-x^{2}}', 1, { num: 2, den: 1 }, true);
    const diverge = comparacaoComPassos('maior', '\\frac{1}{x}', 1, { num: 1, den: 1 }, false);

    expect(converge.resultado).toBe(true);
    expect(diverge.resultado).toBe(false);
  });

  it('ficar abaixo de algo que diverge não garante nada', () => {
    const indeciso = comparacaoComPassos('menor', 'f', 1, { num: 1, den: 1 }, true);
    expect(indeciso.resultado).toBe(false);
  });

  it('o integrando é escrito como se escreve à mão', () => {
    expect(integrandoPotenciaTex({ num: 1, den: 2 })).toBe('\\frac{1}{\\sqrt{x}}');
    expect(integrandoPotenciaTex({ num: 1, den: 1 })).toBe('\\frac{1}{x}');
    expect(integrandoPotenciaTex({ num: 3, den: 1 })).toBe('\\frac{1}{x^{3}}');
  });
});
