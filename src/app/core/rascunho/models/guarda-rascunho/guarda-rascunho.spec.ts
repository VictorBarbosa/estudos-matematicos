import { Arvore, paraTexto } from '@core/rascunho/models/peca/peca';
import { linhasDe } from '@core/rascunho/models/linhas/linhas';
import {
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
     * Ao estourar o teto, recusa-se a gravar — e não se descarta nada.
     *
     * Jogar fora a linha mais antiga apagaria o ponto de partida da conta,
     * que é a linha de que todas as outras descendem. Perder o disco é
     * recuperável; perder a primeira linha, não.
     */
    it('o que não cabe devolve nulo, sem cortar nada', () => {
      const gorda = Array.from({ length: 200 }, (_, i) => num(String(i).repeat(20)));
      const guardados = guardar([], 'grande', linhasDe(gorda, 0));

      expect(JSON.stringify(guardados).length).toBeGreaterThan(LIMITE_DE_BYTES);
      expect(serializar(guardados)).toBeNull();
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
      const lido = ler('[{"topico":"a","linhas":[{"tipo":"buraco"}],"atual":"terceira"}]');

      expect(lido[0]!.atual).toBe(0);
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
