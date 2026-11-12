import {
  Arvore,
  BURACO,
  buracosDe,
  caminhosDe,
  comFilhos,
  ehFolha,
  filhosDe,
  noEm,
  paiDe,
  paraTexto,
  precisaParenteses,
  produtoImplicito,
  profundidadeVertical,
  proximoBuraco,
  textoDoNumero,
  trocarEm,
} from '@core/rascunho/models/peca/peca';

const numero = (algarismos: string, negativo = false): Arvore => ({
  tipo: 'numero',
  algarismos,
  negativo,
});

const x: Arvore = { tipo: 'incognita' };

const soma = (esquerda: Arvore, direita: Arvore): Arvore => ({
  tipo: 'operacao',
  operador: '+',
  esquerda,
  direita,
});

const fracao = (numerador: Arvore, denominador: Arvore): Arvore => ({
  tipo: 'fracao',
  numerador,
  denominador,
});

describe('peça e árvore', () => {
  it('a folha não tem filhos e a estrutura tem', () => {
    expect(ehFolha(BURACO)).toBe(true);
    expect(ehFolha(numero('4'))).toBe(true);
    expect(ehFolha(x)).toBe(true);
    expect(ehFolha(soma(BURACO, BURACO))).toBe(false);

    expect(filhosDe(numero('4'))).toEqual([]);
    expect(filhosDe(fracao(numero('1'), numero('2'))).length).toBe(2);
  });

  it('navega e troca pelo caminho', () => {
    const arvore = soma(numero('2'), fracao(numero('1'), BURACO));

    expect(noEm(arvore, [])).toBe(arvore);
    expect(noEm(arvore, [0])).toEqual(numero('2'));
    expect(noEm(arvore, [1, 1])).toEqual(BURACO);
    expect(noEm(arvore, [9])).toBeNull();
    expect(noEm(arvore, [0, 0])).toBeNull();

    const trocada = trocarEm(arvore, [1, 1], numero('3'));
    expect(noEm(trocada, [1, 1])).toEqual(numero('3'));
    // A original fica intacta: os nós são imutáveis.
    expect(noEm(arvore, [1, 1])).toEqual(BURACO);
  });

  it('trocar num caminho que não existe devolve a árvore como estava', () => {
    const arvore = soma(numero('2'), BURACO);

    expect(trocarEm(arvore, [5], numero('9'))).toBe(arvore);
  });

  it('comFilhos não mexe em quem não tem filhos', () => {
    const folha = numero('7');

    expect(comFilhos(folha, [numero('1')])).toBe(folha);
  });

  it('o pai da raiz não existe', () => {
    expect(paiDe([])).toBeNull();
    expect(paiDe([1, 0])).toEqual([1]);
  });

  describe('profundidade', () => {
    it('conta só a fração, porque só ela cresce em altura', () => {
      // `2x + 3 = 11` tem três estruturas encaixadas e nenhuma fração: se a
      // conta fosse de estruturas, o caso de uso do site bateria no teto.
      const equacao: Arvore = {
        tipo: 'igualdade',
        esquerda: soma(
          { tipo: 'operacao', operador: '*', esquerda: numero('2'), direita: x },
          numero('3'),
        ),
        direita: numero('11'),
      };

      expect(profundidadeVertical(equacao)).toBe(0);
    });

    it('cada fração dentro de outra soma um', () => {
      expect(profundidadeVertical(fracao(numero('1'), numero('2')))).toBe(1);
      expect(profundidadeVertical(fracao(fracao(numero('1'), numero('2')), numero('3')))).toBe(2);
      expect(
        profundidadeVertical(fracao(numero('1'), fracao(numero('2'), fracao(numero('3'), BURACO)))),
      ).toBe(3);
    });
  });

  describe('buracos', () => {
    it('os caminhos saem em ordem de leitura', () => {
      const arvore = soma(BURACO, fracao(BURACO, numero('2')));

      expect(caminhosDe(arvore)).toEqual([[], [0], [1], [1, 0], [1, 1]]);
      expect(buracosDe(arvore)).toEqual([[0], [1, 0]]);
    });

    it('o próximo buraco dá a volta', () => {
      const arvore = soma(BURACO, fracao(BURACO, numero('2')));

      expect(proximoBuraco(arvore, [0])).toEqual([1, 0]);
      // Depois do último, volta ao primeiro.
      expect(proximoBuraco(arvore, [1, 0])).toEqual([0]);
    });

    it('sem buraco nenhum, não há para onde ir', () => {
      expect(proximoBuraco(numero('5'), [])).toBeNull();
    });
  });

  describe('desenho', () => {
    it('o parêntese sai da precedência', () => {
      const produto: Arvore = {
        tipo: 'operacao',
        operador: '*',
        esquerda: soma(numero('1'), numero('2')),
        direita: numero('3'),
      };

      // (1 + 2) × 3 precisa de parêntese; 1 + 2 × 3 não.
      expect(
        precisaParenteses(produto, produto.tipo === 'operacao' ? produto.esquerda : BURACO, false),
      ).toBe(true);

      const somaDeProduto = soma(
        { tipo: 'operacao', operador: '*', esquerda: numero('1'), direita: numero('2') },
        numero('3'),
      );
      expect(
        precisaParenteses(
          somaDeProduto,
          somaDeProduto.tipo === 'operacao' ? somaDeProduto.esquerda : BURACO,
          false,
        ),
      ).toBe(false);
    });

    it('o lado direito de menos e de dividido pede parêntese ao empatar', () => {
      const subtracao: Arvore = {
        tipo: 'operacao',
        operador: '-',
        esquerda: numero('5'),
        direita: soma(numero('1'), numero('2')),
      };

      // 5 − (1 + 2) não é 5 − 1 + 2.
      expect(
        precisaParenteses(
          subtracao,
          subtracao.tipo === 'operacao' ? subtracao.direita : BURACO,
          true,
        ),
      ).toBe(true);
    });

    it('a fração se lê como bloco e não pede parêntese', () => {
      const produto: Arvore = {
        tipo: 'operacao',
        operador: '*',
        esquerda: numero('2'),
        direita: fracao(numero('1'), numero('3')),
      };

      expect(
        precisaParenteses(produto, produto.tipo === 'operacao' ? produto.direita : BURACO, true),
      ).toBe(false);
    });

    it('número vezes incógnita se escreve sem o sinal', () => {
      const dois: Arvore = { tipo: 'operacao', operador: '*', esquerda: numero('2'), direita: x };
      const duasIncognitas: Arvore = { tipo: 'operacao', operador: '*', esquerda: x, direita: x };

      expect(produtoImplicito(dois)).toBe(true);
      // `xx` confundiria em vez de abreviar.
      expect(produtoImplicito(duasIncognitas)).toBe(false);
    });

    it('o número mostra o sinal e a vírgula que o aluno pôs', () => {
      expect(textoDoNumero({ tipo: 'numero', algarismos: '3,5', negativo: false })).toBe('3,5');
      expect(textoDoNumero({ tipo: 'numero', algarismos: '7', negativo: true })).toBe('-7');
      // Nó recém-nascido, antes do primeiro algarismo.
      expect(textoDoNumero({ tipo: 'numero', algarismos: '', negativo: false })).toBe('0');
    });
  });

  describe('paraTexto', () => {
    it('escreve a conta na gramática que o corretor do treino lê', () => {
      const equacao: Arvore = {
        tipo: 'igualdade',
        esquerda: soma(
          { tipo: 'operacao', operador: '*', esquerda: numero('2'), direita: x },
          numero('3'),
        ),
        direita: numero('11'),
      };

      expect(paraTexto(equacao)).toBe('2x + 3 = 11');
    });

    it('a fração sai com os dois lados fechados, e o buraco se declara', () => {
      expect(paraTexto(fracao(numero('1'), soma(x, numero('2'))))).toBe('(1)/(x + 2)');
      expect(paraTexto(BURACO)).toBe('?');
    });
  });
});
