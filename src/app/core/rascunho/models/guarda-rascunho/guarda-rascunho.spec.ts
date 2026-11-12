import { Arvore, paraTexto } from '@core/rascunho/models/peca/peca';
import { LIMITE_DE_FRACOES } from '@core/rascunho/models/montagem/montagem';
import { LIMITE_DE_LINHAS, linhasDe } from '@core/rascunho/models/linhas/linhas';
import {
  Guardados,
  LIMITE_DE_BYTES,
  LIMITE_DE_TOPICOS,
  doTopico,
  esquecer,
  guardar,
  ler,
  serializar,
  validarArvore,
} from '@core/rascunho/models/guarda-rascunho/guarda-rascunho';

const num = (algarismos: string): Arvore => ({ tipo: 'numero', algarismos, negativo: false });
const INCOGNITA: Arvore = { tipo: 'incognita' };

describe('guarda do rascunho', () => {
  it('guardar põe o tópico na frente da fila', () => {
    const um = guardar([], 'algebra/inequacoes', linhasDe([num('1')], 0));
    const dois = guardar(um, 'frações/soma', linhasDe([num('2')], 0));

    expect(dois.map((item) => item.topico)).toEqual(['frações/soma', 'algebra/inequacoes']);
  });

  it('mexer num tópico que já estava guardado o traz para a frente, sem duplicar', () => {
    const um = guardar([], 'a', linhasDe([num('1')], 0));
    const dois = guardar(um, 'b', linhasDe([num('2')], 0));
    const devolta = guardar(dois, 'a', linhasDe([num('3')], 0));

    expect(devolta.map((item) => item.topico)).toEqual(['a', 'b']);
    expect(paraTexto(devolta[0]!.linhas[0]!)).toBe('3');
  });

  it('o sexto tópico empurra o mais antigo para fora', () => {
    let guardados = guardar([], 'inicial', linhasDe([num('0')], 0));

    for (let i = 1; i <= LIMITE_DE_TOPICOS; i++) {
      guardados = guardar(guardados, `topico-${i}`, linhasDe([num(String(i))], 0));
    }

    expect(guardados.length).toBe(LIMITE_DE_TOPICOS);
    expect(guardados.some((item) => item.topico === 'inicial')).toBe(false);
  });

  it('lê de volta o rascunho de um tópico, e nada de um que não existe', () => {
    const guardados = guardar([], 'calculo-1/limites', linhasDe([num('1'), num('2')], 1));

    const lido = doTopico(guardados, 'calculo-1/limites');

    expect(lido).not.toBeNull();
    expect(lido!.linhas.length).toBe(2);
    expect(lido!.atual).toBe(1);
    expect(doTopico(guardados, 'outro')).toBeNull();
  });

  it('esquecer tira só o tópico pedido', () => {
    const guardados = guardar(
      guardar([], 'a', linhasDe([num('1')], 0)),
      'b',
      linhasDe([num('2')], 0),
    );

    expect(esquecer(guardados, 'a').map((item) => item.topico)).toEqual(['b']);
  });

  describe('serializar', () => {
    it('o que cabe vai e volta inteiro', () => {
      const guardados = guardar([], 'tema', linhasDe([num('123')], 0));
      const texto = serializar(guardados);

      expect(texto).not.toBeNull();
      expect(ler(texto)).toEqual(guardados);
    });

    /**
     * O caso que o teto antigo quebrava: cinco tópicos cheios.
     *
     * Com 8 kB globais, um tópico de 20 linhas ocupava 82% do teto e o segundo
     * derrubava a gravação de todos — o aluno continuava montando e o disco
     * ficava com a versão velha, que é exatamente o acidente que esta
     * persistência existe para evitar.
     */
    it('cinco tópicos com a pilha cheia continuam caber', () => {
      const equacao: Arvore = {
        tipo: 'igualdade',
        esquerda: {
          tipo: 'operacao',
          operador: '+',
          esquerda: { tipo: 'operacao', operador: '*', esquerda: num('2'), direita: INCOGNITA },
          direita: num('3'),
        },
        direita: num('11'),
      };
      const cheia = linhasDe(
        Array.from({ length: LIMITE_DE_LINHAS }, () => equacao),
        0,
      );

      let guardados: Guardados = [];
      for (let i = 0; i < LIMITE_DE_TOPICOS; i++) {
        guardados = guardar(guardados, `topico-${i}`, cheia);
      }

      const texto = serializar(guardados);

      expect(texto).not.toBeNull();
      expect(ler(texto).length).toBe(LIMITE_DE_TOPICOS);
    });

    /**
     * Estourando, larga-se o tópico mais antigo — não se desiste de gravar.
     *
     * É o mesmo critério que `LIMITE_DE_TOPICOS` já aplica por contagem.
     * Reagir ao excesso de bytes de um jeito e ao de tópicos de outro não teria
     * defesa — e desistir de gravar significa perder tudo na aba que morre.
     */
    it('ao estourar, grava o que cabe e larga o mais antigo', () => {
      // Um tópico calibrado para encostar no teto: cabe sozinho, e nada mais
      // cabe ao lado dele. O tamanho sai do próprio formato, não de um chute.
      const vazio = JSON.stringify(guardar([], 'gordo', linhasDe([num('9')], 0))).length;
      const gorda = linhasDe([num('9'.repeat(LIMITE_DE_BYTES - vazio))], 0);
      const soGordo = guardar([], 'gordo', gorda);

      expect(serializar(soGordo)).not.toBeNull();

      // O antigo é o gordo; o recente é o leve.
      const guardados = guardar(soGordo, 'leve', linhasDe([num('7')], 0));
      const texto = serializar(guardados);

      expect(JSON.stringify(guardados).length).toBeGreaterThan(LIMITE_DE_BYTES);
      expect(texto).not.toBeNull();
      expect(ler(texto).map((item) => item.topico)).toEqual(['leve']);
    });

    /**
     * `null` fica para quando nem o tópico mais recente cabe.
     *
     * Aí não se grava nada: o disco conserva o que tinha e a memória conserva o
     * que o aluno montou. Gravar uma lista vazia apagaria o rascunho dos outros
     * tópicos para registrar o fracasso deste.
     */
    it('nem o mais recente cabendo, não grava nada', () => {
      const gigante = linhasDe([num('1'.repeat(LIMITE_DE_BYTES + 100))], 0);
      const guardados = guardar([], 'gigante', gigante);

      expect(serializar(guardados)).toBeNull();
    });

    it('fila vazia grava fila vazia, e não nulo', () => {
      expect(serializar([])).toBe('[]');
    });
  });

  describe('ler desconfiada', () => {
    it('sem nada guardado, a fila está vazia', () => {
      expect(ler(null)).toEqual([]);
      expect(ler('isto não é JSON')).toEqual([]);
      expect(ler('{"nao":"um array"}')).toEqual([]);
    });

    it('descarta o tópico sem nome e o sem linha válida', () => {
      expect(ler('[{"topico":"","linhas":[{"tipo":"buraco"}]}]')).toEqual([]);
      expect(ler('[{"topico":"a","linhas":[{"tipo":"peca-do-futuro"}]}]')).toEqual([]);
      expect(ler('[{"topico":"a"}]')).toEqual([]);
    });

    it('um índice de linha estragado volta como zero', () => {
      const lido = ler(
        '[{"topico":"a","linhas":[{"tipo":"numero","algarismos":"4","negativo":false}],"atual":"terceira"}]',
      );

      expect(lido[0]!.atual).toBe(0);
    });

    /**
     * A linha estragada vira buraco e guarda a posição.
     *
     * Descartá-la renumeraria as outras, e `atual` passaria a apontar para
     * outra linha: a conta apareceria embaralhada sem o aluno entender por quê.
     */
    it('a linha estragada vira buraco, sem renumerar as outras', () => {
      const lido = ler(
        '[{"topico":"a","linhas":[' +
          '{"tipo":"numero","algarismos":"1","negativo":false},' +
          '{"tipo":"peca-do-futuro"},' +
          '{"tipo":"numero","algarismos":"3","negativo":false}' +
          '],"atual":2}]',
      );

      expect(lido[0]!.linhas.length).toBe(3);
      expect(lido[0]!.linhas[1]).toEqual({ tipo: 'buraco' });
      expect(paraTexto(lido[0]!.linhas[2]!)).toBe('3');
    });

    it('tópico que só tem buracos não é rascunho', () => {
      expect(ler('[{"topico":"a","linhas":[{"tipo":"buraco"},{"tipo":"buraco"}]}]')).toEqual([]);
    });

    /**
     * Forma certa não basta: a linha tem de obedecer aos invariantes.
     *
     * Uma árvore mais funda que o teto seria desenhada e tomaria a tela toda —
     * o que `LIMITE_DE_FRACOES` existe para evitar —, e dali em diante todo
     * envolvimento seria recusado sem explicação.
     */
    it('recusa linha mais funda que o teto de frações', () => {
      const fundo = (nivel: number): string =>
        nivel === 0
          ? '{"tipo":"numero","algarismos":"1","negativo":false}'
          : `{"tipo":"fracao","numerador":${fundo(nivel - 1)},"denominador":{"tipo":"buraco"}}`;

      expect(ler(`[{"topico":"a","linhas":[${fundo(LIMITE_DE_FRACOES)}]}]`).length).toBe(1);
      expect(ler(`[{"topico":"a","linhas":[${fundo(LIMITE_DE_FRACOES + 1)}]}]`)).toEqual([]);
    });

    it('recusa igualdade fora da raiz, ou repetida, vinda do disco', () => {
      const dentro =
        '{"tipo":"operacao","operador":"+","esquerda":{"tipo":"igualdade","esquerda":{"tipo":"buraco"},"direita":{"tipo":"buraco"}},"direita":{"tipo":"buraco"}}';

      expect(ler(`[{"topico":"a","linhas":[${dentro}]}]`)).toEqual([]);
    });
  });

  describe('validarArvore', () => {
    it('aceita cada tipo de nó que esta fase conhece', () => {
      expect(validarArvore({ tipo: 'buraco' })).toEqual({ tipo: 'buraco' });
      expect(validarArvore({ tipo: 'incognita' })).toEqual({ tipo: 'incognita' });
      expect(validarArvore({ tipo: 'numero', algarismos: '3,5', negativo: true })).toEqual({
        tipo: 'numero',
        algarismos: '3,5',
        negativo: true,
      });
      expect(
        validarArvore({
          tipo: 'fracao',
          numerador: { tipo: 'numero', algarismos: '1', negativo: false },
          denominador: { tipo: 'buraco' },
        }),
      ).not.toBeNull();
    });

    it('recusa o que não é árvore', () => {
      expect(validarArvore(null)).toBeNull();
      expect(validarArvore('x')).toBeNull();
      expect(validarArvore({ tipo: 'raiz' })).toBeNull();
    });

    it('recusa número com algarismos impossíveis', () => {
      expect(validarArvore({ tipo: 'numero', algarismos: '1,2,3', negativo: false })).toBeNull();
      expect(validarArvore({ tipo: 'numero', algarismos: 'x', negativo: false })).toBeNull();
      expect(validarArvore({ tipo: 'numero', algarismos: 7, negativo: false })).toBeNull();
      // Vírgula solta e número vazio não são números.
      expect(validarArvore({ tipo: 'numero', algarismos: ',', negativo: false })).toBeNull();
      expect(validarArvore({ tipo: 'numero', algarismos: '', negativo: false })).toBeNull();
      // Vírgula pendurada, sim: é número em composição.
      expect(validarArvore({ tipo: 'numero', algarismos: '5,', negativo: false })).not.toBeNull();
    });

    it('recusa operador inventado e filho estragado', () => {
      const filho = { tipo: 'buraco' };

      expect(
        validarArvore({ tipo: 'operacao', operador: '^', esquerda: filho, direita: filho }),
      ).toBeNull();
      expect(
        validarArvore({
          tipo: 'operacao',
          operador: '+',
          esquerda: filho,
          direita: { tipo: 'nada' },
        }),
      ).toBeNull();
      expect(validarArvore({ tipo: 'igualdade', esquerda: filho })).toBeNull();
      expect(
        validarArvore({ tipo: 'fracao', numerador: { tipo: 'nada' }, denominador: filho }),
      ).toBeNull();
    });

    it('a recusa é recursiva: lixo no fundo invalida a árvore toda', () => {
      const fundo = {
        tipo: 'fracao',
        numerador: { tipo: 'buraco' },
        denominador: {
          tipo: 'operacao',
          operador: '+',
          esquerda: { tipo: 'buraco' },
          direita: { tipo: 'potencia' },
        },
      };

      expect(validarArvore(fundo)).toBeNull();
    });
  });
});
