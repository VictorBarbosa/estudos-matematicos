import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, corrigir } from '@core/treino/models/treino.model';

/** Um gerador numérico mínimo, com uma armadilha conhecida. */
function geradorCom(gabarito: number, armadilha?: number): GeradorExercicio<number> {
  return {
    topicoId: 'teste',
    formatoResposta: 'um número',
    gerar: () => exercicioCom(gabarito, armadilha),
    analisar: analisarNumero,
    ...numeroComCasas(2, 1e-4),
  };
}

function exercicioCom(gabarito: number, armadilha?: number): Exercicio<number> {
  return {
    id: 'teste-1',
    nivel: 'facil',
    enunciado: 'Qual é o número?',
    enunciadoTex: '',
    gabarito,
    resolucao: { resultado: gabarito, passos: [] },
    conceitos: [],
    armadilhas:
      armadilha === undefined
        ? []
        : [{ resposta: armadilha, diagnostico: 'Desvio conhecido.', passo: 1 }],
  };
}

describe('corrigir e o ponto ambíguo', () => {
  const vereditoDe = (gabarito: number, escrita: string, armadilha?: number) =>
    corrigir(geradorCom(gabarito, armadilha), exercicioCom(gabarito, armadilha), escrita).veredito;

  it('aceita o decimal escrito com ponto, mesmo na forma de milhar', () => {
    // O aluno copia da calculadora: 5/6 = 0.833, 11/8 = 1.375, 1 = 1.000.
    expect(vereditoDe(0.8333, '0.833')).toBe('correto');
    expect(vereditoDe(1.375, '1.375')).toBe('correto');
    expect(vereditoDe(1, '1.000')).toBe('correto');
  });

  it('e continua aceitando o milhar de verdade', () => {
    // É a forma que o próprio site mostra como resposta correta.
    expect(vereditoDe(1375, '1.375')).toBe('correto');
    expect(vereditoDe(50_000_000, '50.000.000')).toBe('correto');
  });

  it('a segunda leitura não transforma erro em acerto', () => {
    expect(vereditoDe(7, '1.375')).toBe('incorreto');
    expect(vereditoDe(2, '0.833')).toBe('incorreto');
  });

  it('a armadilha continua sendo reconhecida', () => {
    const validacao = corrigir(geradorCom(5, 3), exercicioCom(5, 3), '3');

    expect(validacao.veredito).toBe('incorreto');
    expect(validacao.diagnostico).toBe('Desvio conhecido.');
  });

  it('o que não dá para ler segue sem contar como erro', () => {
    expect(vereditoDe(5, 'qualquer coisa')).toBe('invalido');
  });
});

/**
 * A resposta certa obtida com uma constante arredondada.
 *
 * O aluno que calcula a área de um círculo de raio 33 com π = 3,14 — o π que a
 * escola ensina — chega a 3419,46, e o valor exato é 3421,19. Ele fez tudo
 * certo, e um comparador de tolerância absoluta responde «não é isso» exibindo
 * um número que ele não tinha como obter. O erro de arredondar uma constante é
 * relativo, então nenhuma tolerância absoluta resolve: ela esconde o problema
 * em resposta pequena e reprova em resposta grande.
 */
describe('corrigir e a constante arredondada', () => {
  const EXATO = Math.PI * 33 * 33; // 3421,1944
  const COM_ESCOLA = 3.14 * 33 * 33; // 3419,46

  it('aceita a resposta de quem usou π = 3,14, e diz por quê', () => {
    const validacao = corrigir(
      geradorCom(EXATO),
      exercicioCom(EXATO),
      COM_ESCOLA.toFixed(2).replace('.', ','),
    );

    expect(validacao.veredito).toBe('correto');
    // Vale como acerto e explica: calar isso ensinaria que a diferença não existe.
    expect(validacao.observacao).toContain('arredondamento');
    expect(validacao.observacao).toContain('3.421,19');
  });

  it('o erro de conceito continua errado', () => {
    // Quem esqueceu de elevar o raio ao quadrado: π·33 em vez de π·33².
    expect(corrigir(geradorCom(EXATO), exercicioCom(EXATO), '103,67').veredito).toBe('incorreto');
    // E um desvio de 1% está fora da folga de 0,2%.
    expect(corrigir(geradorCom(EXATO), exercicioCom(EXATO), '3455,41').veredito).toBe('incorreto');
  });

  /**
   * Onde a resposta é inteira não houve constante a arredondar, e a exatidão é
   * a própria medida: sem esta trava, um gabarito de 65 536 aceitaria ±131.
   */
  it('gabarito inteiro não ganha folga nenhuma', () => {
    expect(corrigir(geradorCom(65_536), exercicioCom(65_536), '65.500').veredito).toBe('incorreto');
    expect(corrigir(geradorCom(252), exercicioCom(252), '252,4').veredito).toBe('incorreto');
    expect(corrigir(geradorCom(252), exercicioCom(252), '252').veredito).toBe('correto');
  });

  /**
   * A armadilha é conferida ANTES da folga, senão um desvio conhecido passaria
   * por «quase certo» e o aluno perderia o diagnóstico — que é o que o site tem
   * de melhor.
   */
  it('a armadilha dentro da folga continua sendo diagnosticada', () => {
    const quaseCerto = EXATO * 1.001; // dentro de 0,2%
    const validacao = corrigir(
      geradorCom(EXATO, quaseCerto),
      exercicioCom(EXATO, quaseCerto),
      quaseCerto.toFixed(2).replace('.', ','),
    );

    expect(validacao.veredito).toBe('incorreto');
    expect(validacao.diagnostico).toBe('Desvio conhecido.');
  });

  it('a folga acompanha o tamanho: a mesma diferença absoluta decide diferente', () => {
    // 1,73 sobre 3421 é arredondamento de constante; sobre 12,57 é outra conta.
    expect(corrigir(geradorCom(EXATO), exercicioCom(EXATO), '3419,46').veredito).toBe('correto');

    const pequeno = Math.PI * 2 * 2; // 12,566
    expect(corrigir(geradorCom(pequeno), exercicioCom(pequeno), '10,84').veredito).toBe(
      'incorreto',
    );
    // Mas o π da escola também vale no pequeno: 3,14·4 = 12,56.
    expect(corrigir(geradorCom(pequeno), exercicioCom(pequeno), '12,56').veredito).toBe('correto');
  });
});
