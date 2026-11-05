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
