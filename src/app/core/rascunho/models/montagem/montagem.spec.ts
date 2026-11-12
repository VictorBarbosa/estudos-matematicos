import { Arvore, paraTexto, textoDoNumero } from '@core/rascunho/models/peca/peca';
import {
  LIMITE_DE_FRACOES,
  MONTAGEM_VAZIA,
  Montagem,
  Peca,
  apagar,
  avancarSePreciso,
  encaixar,
  irAoProximoBuraco,
  montagemDe,
  selecionar,
  subirNivel,
  virarLados,
} from '@core/rascunho/models/montagem/montagem';

const BURACO_LIVRE: Arvore = { tipo: 'buraco' };
const digito = (valor: string): Peca => ({ tipo: 'algarismo', valor });
const operacao = (operador: '+' | '-' | '*' | '/'): Peca => ({ tipo: 'operacao', operador });
const FRACAO: Peca = { tipo: 'fracao' };
const IGUAL: Peca = { tipo: 'igualdade' };
const INCOGNITA: Peca = { tipo: 'incognita' };

/** Toca uma peça depois da outra, com o avanço automático, como a tela faz. */
function tocar(inicial: Montagem, pecas: readonly Peca[]): Montagem {
  return pecas.reduce(
    (montagem, peca) => avancarSePreciso(encaixar(montagem, peca), peca).montagem,
    inicial,
  );
}

describe('montagem', () => {
  it('a linha nasce como um buraco só, selecionado', () => {
    expect(MONTAGEM_VAZIA.arvore.tipo).toBe('buraco');
    expect(MONTAGEM_VAZIA.selecao).toEqual([]);
  });

  describe('encaixar', () => {
    it('o algarismo entra no buraco e os seguintes se juntam a ele', () => {
      const montada = tocar(MONTAGEM_VAZIA, [digito('4'), digito('8'), digito('7')]);

      expect(paraTexto(montada.arvore)).toBe('487');
      // Um nó só: `487` são três toques no mesmo número, não três peças.
      expect(montada.arvore.tipo).toBe('numero');
    });

    it('a vírgula não começa número sozinha, e não se repete', () => {
      const comVirgula = tocar(MONTAGEM_VAZIA, [{ tipo: 'virgula' }]);
      const no = comVirgula.arvore;
      // Na tela ela aparece: o aluno está no meio de escrever o número.
      expect(no.tipo === 'numero' && textoDoNumero(no)).toBe('0,');

      const umaSo = tocar(comVirgula, [digito('5'), { tipo: 'virgula' }]);
      expect(paraTexto(umaSo.arvore)).toBe('0,5');
    });

    /**
     * A vírgula pendurada não escapa para o texto da conta.
     *
     * `5,` é número em composição, e mostrá-lo assim é honesto. Mas o corretor
     * do treino não reconhece `5.` como número, então a conferência da fase 2
     * diria «não sei conferir» por causa de uma vírgula que o aluno ia
     * preencher.
     */
    it('o texto da conta não leva vírgula pendurada', () => {
      const pendurada = tocar(MONTAGEM_VAZIA, [digito('5'), { tipo: 'virgula' }]);
      const no = pendurada.arvore;

      expect(no.tipo === 'numero' && textoDoNumero(no)).toBe('5,');
      expect(paraTexto(pendurada.arvore)).toBe('5');
    });

    it('o sinal troca o sinal do número, e não mexe em outra peça', () => {
      const negativo = tocar(MONTAGEM_VAZIA, [digito('7'), { tipo: 'sinal' }]);
      expect(paraTexto(negativo.arvore)).toBe('-7');

      const naIncognita = encaixar(tocar(MONTAGEM_VAZIA, [INCOGNITA]), { tipo: 'sinal' });
      expect(naIncognita.recusa).toBe('sem-efeito');
    });

    it('número e depois incógnita dão o produto, como se escreve no papel', () => {
      const montada = tocar(MONTAGEM_VAZIA, [digito('2'), INCOGNITA]);

      expect(paraTexto(montada.arvore)).toBe('2x');
    });

    it('a estrutura entra no buraco com a seleção no primeiro buraco dela', () => {
      const { montagem, recusa } = encaixar(MONTAGEM_VAZIA, FRACAO);

      expect(recusa).toBeNull();
      expect(montagem.arvore.tipo).toBe('fracao');
      expect(montagem.selecao).toEqual([0]);
    });
  });

  describe('envolver', () => {
    it('divide os dois lados por dois sem que a ferramenta decida nada', () => {
      // «2x = 8», e agora o aluno divide os dois lados por 2.
      const equacao = montagemDe({
        tipo: 'igualdade',
        esquerda: {
          tipo: 'operacao',
          operador: '*',
          esquerda: num('2'),
          direita: { tipo: 'incognita' },
        },
        direita: num('8'),
      });

      const esquerdaSelecionada = selecionar(equacao, [0]).montagem;
      const envolvida = encaixar(esquerdaSelecionada, operacao('/'));

      expect(paraTexto(envolvida.montagem.arvore)).toBe('2x / ? = 8');
      // A seleção cai no buraco que sobrou, não no que já estava preenchido.
      expect(envolvida.montagem.selecao).toEqual([0, 1]);

      const comDois = encaixar(envolvida.montagem, digito('2'));
      expect(paraTexto(comDois.montagem.arvore)).toBe('2x / 2 = 8');
    });

    it('a peça envolvida vira o primeiro filho e o resto da árvore fica de pé', () => {
      const soma = montagemDe({
        tipo: 'operacao',
        operador: '+',
        esquerda: num('5'),
        direita: num('3'),
      });
      const naEsquerda = selecionar(soma, [0]).montagem;

      const envolvida = encaixar(naEsquerda, FRACAO);

      expect(paraTexto(envolvida.montagem.arvore)).toBe('(5)/(?) + 3');
    });
  });

  describe('as regras do envolver', () => {
    it('o igual envolve a linha inteira, mesmo com uma folha selecionada', () => {
      // O lugar do `=` é único — a raiz —, então não há escolha a fazer, e
      // obrigar a subir até lá seria cobrar um toque por um destino só.
      const soma = montagemDe({
        tipo: 'operacao',
        operador: '+',
        esquerda: num('1'),
        direita: num('2'),
      });
      const dentro = selecionar(soma, [1]).montagem;

      const comIgual = encaixar(dentro, IGUAL);

      expect(comIgual.recusa).toBeNull();
      expect(paraTexto(comIgual.montagem.arvore)).toBe('1 + 2 = ?');
      expect(comIgual.montagem.selecao).toEqual([1]);
    });

    it('o igual não se repete na mesma linha', () => {
      const comIgual = encaixar(MONTAGEM_VAZIA, IGUAL).montagem;

      expect(encaixar(comIgual, IGUAL).recusa).toBe('igualdade-repetida');
    });

    /**
     * O caminho que levava a duas igualdades numa linha, em seis toques.
     *
     * `2 = 3`, tocar no sinal `=` (que seleciona a raiz), envolver em `+` — e a
     * raiz deixava de ser igualdade, liberando o `=` outra vez. Saía
     * `(2 = 3) + ? = ?`, que não é conta nenhuma.
     */
    it('uma igualdade não se envolve em outra conta', () => {
      const equacao = montagemDe({
        tipo: 'igualdade',
        esquerda: num('2'),
        direita: num('3'),
      });
      const naRaiz = selecionar(equacao, []).montagem;

      expect(encaixar(naRaiz, operacao('+')).recusa).toBe('igualdade-envolvida');
      expect(encaixar(naRaiz, FRACAO).recusa).toBe('igualdade-envolvida');
    });

    it('o igual é recusado mesmo escondido no fundo da árvore', () => {
      // Defesa em profundidade: se um dia uma árvore assim chegar do disco, a
      // peça `=` não a piora.
      const estranha = montagemDe({
        tipo: 'operacao',
        operador: '+',
        esquerda: { tipo: 'igualdade', esquerda: num('2'), direita: num('3') },
        direita: BURACO_LIVRE,
      });

      expect(encaixar(estranha, IGUAL).recusa).toBe('igualdade-repetida');
    });

    it('envolver um buraco é permitido: é como se monta de cima para baixo', () => {
      const { montagem, recusa } = encaixar(MONTAGEM_VAZIA, operacao('+'));

      expect(recusa).toBeNull();
      expect(paraTexto(montagem.arvore)).toBe('? + ?');
    });

    it('fração dentro de fração para no teto', () => {
      let montagem = MONTAGEM_VAZIA;

      for (let nivel = 0; nivel < LIMITE_DE_FRACOES; nivel++) {
        const passo = encaixar(montagem, FRACAO);
        expect(passo.recusa).toBeNull();
        montagem = passo.montagem;
      }

      const demais = encaixar(montagem, FRACAO);
      expect(demais.recusa).toBe('profundidade');
      // Recusar não mexe no que já estava montado.
      expect(demais.montagem).toBe(montagem);
    });
  });

  describe('as outras ações', () => {
    it('apagar devolve o buraco e não deixa órfão', () => {
      const montada = tocar(MONTAGEM_VAZIA, [digito('2'), INCOGNITA]);
      const noProduto = subirNivel(montada).montagem;

      const apagada = apagar(noProduto);

      expect(apagada.montagem.arvore.tipo).toBe('buraco');
      expect(apagada.montagem.selecao).toEqual(noProduto.selecao);
    });

    it('apagar um buraco não faz nada', () => {
      expect(apagar(MONTAGEM_VAZIA).recusa).toBe('sem-efeito');
    });

    it('virar os lados dá caminho para «3 − 2x»', () => {
      // Envolver `2x` com menos só produz `2x − ?`; é o ⇄ que resolve.
      const produto = montagemDe({
        tipo: 'operacao',
        operador: '*',
        esquerda: num('2'),
        direita: { tipo: 'incognita' },
      });
      const envolvida = encaixar(produto, operacao('-')).montagem;
      const comTres = encaixar(envolvida, digito('3')).montagem;
      expect(paraTexto(comTres.arvore)).toBe('2x - 3');

      const naOperacao = selecionar(comTres, []).montagem;
      const virada = virarLados(naOperacao);

      expect(paraTexto(virada.montagem.arvore)).toBe('3 - 2x');
    });

    it('virar a fração troca numerador e denominador', () => {
      const meio = montagemDe({ tipo: 'fracao', numerador: num('1'), denominador: num('2') });

      expect(paraTexto(virarLados(meio).montagem.arvore)).toBe('(2)/(1)');
    });

    it('não há o que virar numa folha', () => {
      expect(virarLados(montagemDe(num('4'))).recusa).toBe('sem-efeito');
    });

    it('subir sai do nó de dentro, e da raiz não sobe', () => {
      const fracao = encaixar(MONTAGEM_VAZIA, FRACAO).montagem;
      expect(fracao.selecao).toEqual([0]);

      expect(subirNivel(fracao).montagem.selecao).toEqual([]);
      expect(subirNivel(MONTAGEM_VAZIA).recusa).toBe('sem-efeito');
    });

    it('ir ao próximo buraco dá a volta', () => {
      const soma = encaixar(MONTAGEM_VAZIA, operacao('+')).montagem;

      expect(soma.selecao).toEqual([0]);
      expect(irAoProximoBuraco(soma).montagem.selecao).toEqual([1]);
    });

    it('selecionar um caminho que não existe não mexe na seleção', () => {
      expect(selecionar(MONTAGEM_VAZIA, [3, 4]).recusa).toBe('sem-efeito');
    });
  });

  describe('os atalhos de toque', () => {
    it('com um buraco só na árvore, a peça entra nele sem o toque de seleção', () => {
      // `x + ▢`, com a seleção de volta no `x`: um algarismo tocado aqui não
      // teria onde entrar, porque incógnita não aceita algarismo. O atalho
      // manda a peça ao único buraco que existe, em vez de não fazer nada.
      const soma = encaixar(MONTAGEM_VAZIA, operacao('+')).montagem;
      const comIncognita = encaixar(soma, INCOGNITA).montagem;
      const noX = selecionar(comIncognita, [0]).montagem;

      const comTres = encaixar(noX, digito('3'));

      expect(comTres.recusa).toBeNull();
      expect(paraTexto(comTres.montagem.arvore)).toBe('x + 3');
    });

    it('o algarismo continua no número em composição, mesmo havendo outro buraco', () => {
      // Com a regra ao contrário, `12` seria impossível de escrever aqui: o
      // `2` pularia para o buraco da direita.
      const soma = encaixar(MONTAGEM_VAZIA, operacao('+')).montagem;
      const comUm = encaixar(soma, digito('1')).montagem;

      expect(paraTexto(encaixar(comUm, digito('2')).montagem.arvore)).toBe('12 + ?');
    });

    it('o atalho não atropela o envolver: estrutura continua envolvendo', () => {
      const soma = encaixar(MONTAGEM_VAZIA, operacao('+')).montagem;
      const comDois = encaixar(soma, digito('2')).montagem;

      // Há um buraco só, mas a peça é estrutura: o `2` é que deve ser envolvido.
      const envolvida = encaixar(comDois, FRACAO);

      expect(paraTexto(envolvida.montagem.arvore)).toBe('(2)/(?) + ?');
    });

    it('sem buraco para onde ir, o encaixe continua valendo sem recusa', () => {
      // Montar `2x` numa linha sem outro buraco: a árvore está certa, então
      // `recusa` tem de ser nula — ela é API, não só fonte de aviso na tela.
      const comDois = encaixar(MONTAGEM_VAZIA, digito('2'));
      const comX = avancarSePreciso(encaixar(comDois.montagem, INCOGNITA), INCOGNITA);

      expect(paraTexto(comX.montagem.arvore)).toBe('2x');
      expect(comX.recusa).toBeNull();
    });

    it('o avanço automático não quebra o número em composição', () => {
      const montada = tocar(MONTAGEM_VAZIA, [operacao('+'), digito('1'), digito('2')]);

      // Os dois algarismos foram para o mesmo número, não um em cada lado.
      expect(paraTexto(montada.arvore)).toBe('12 + ?');
    });

    /**
     * O caso que decide se a ferramenta é usada ou abandonada.
     *
     * Pelo caminho ingênuo — tocar o buraco, tocar a peça, para cada átomo —
     * esta linha custaria quinze toques. Aqui ela custa oito, e o único toque
     * que não é peça é o `⬆`: depois de escrever o `2`, a seleção está no
     * número, e é o produto `2x` inteiro que a soma deve envolver.
     */
    it('«2x + 3 = 11» sai em oito toques', () => {
      let montagem = MONTAGEM_VAZIA;
      let toques = 0;

      const peca = (p: Peca): void => {
        montagem = avancarSePreciso(encaixar(montagem, p), p).montagem;
        toques++;
      };

      const subir = (): void => {
        montagem = subirNivel(montagem).montagem;
        toques++;
      };

      peca({ tipo: 'coeficiente' }); // ▢x, com a seleção no coeficiente
      peca(digito('2')); // 2x
      subir(); // sai do número e pega o produto inteiro
      peca(operacao('+')); // 2x + ▢
      peca(digito('3')); // 2x + 3
      peca(IGUAL); // 2x + 3 = ▢  (o igual acha a raiz sozinho)
      peca(digito('1'));
      peca(digito('1')); // = 11

      expect(paraTexto(montagem.arvore)).toBe('2x + 3 = 11');
      expect(toques).toBe(8);
    });
  });
});

function num(algarismos: string): Arvore {
  return { tipo: 'numero', algarismos, negativo: false };
}
