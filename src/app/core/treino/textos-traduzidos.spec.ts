import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import {
  Exercicio,
  NIVEIS,
  dicaEm,
  diagnosticoEm,
  enunciadoEm,
  formatoRespostaEm,
} from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * O exercício traduzido está traduzido por inteiro.
 *
 * A tradução dos geradores é gradual: quem ainda não declarou `traducoes`
 * continua em português, e isso é aceito. O que não se aceita é a meia
 * tradução — o enunciado em francês com a dica em português, ou a dica
 * traduzida e o diagnóstico do erro não. Quem declara o campo declara as duas
 * línguas, e as duas frases.
 *
 * O número de valores também é conferido: uma tradução que perde um dos
 * números transforma o exercício num problema impossível, e é o tipo de erro
 * que passa despercebido a olho nu.
 */
const AMOSTRA_POR_NIVEL = 40;

/** Os números presentes numa frase, na ordem em que aparecem. */
function numeros(texto: string): readonly string[] {
  return texto.match(/\d+/g) ?? [];
}

function amostra(topico: string, gerador: (typeof TODOS_OS_GERADORES)[number][1]) {
  const rng = criarRng(20261110);
  const exercicios: { nivel: string; exercicio: Exercicio<unknown> }[] = [];

  for (const nivel of NIVEIS) {
    for (let i = 0; i < AMOSTRA_POR_NIVEL; i++) {
      exercicios.push({ nivel, exercicio: gerador.gerar(nivel, rng) });
    }
  }

  return exercicios;
}

describe('textos traduzidos dos exercícios', () => {
  for (const [topico, gerador] of TODOS_OS_GERADORES) {
    it(`${topico}: a tradução declarada está completa`, () => {
      for (const { nivel, exercicio } of amostra(topico, gerador)) {
        if (exercicio.traducoes === undefined) {
          continue;
        }

        for (const idioma of ['fr', 'en'] as const) {
          const texto = exercicio.traducoes[idioma];

          expect(texto?.enunciado.length ?? 0, `${nivel}: ${exercicio.enunciado}`).toBeGreaterThan(
            10,
          );
          expect(texto?.enunciado, `${nivel}: ${exercicio.enunciado}`).not.toBe(
            exercicio.enunciado,
          );
          expect(numeros(texto?.enunciado ?? ''), `números de ${idioma}`).toEqual(
            numeros(exercicio.enunciado),
          );

          if (exercicio.dica) {
            expect(dicaEm(exercicio, idioma), `dica de ${idioma}`).toBeTruthy();
          }
        }

        for (const armadilha of exercicio.armadilhas) {
          if (armadilha.diagnosticoTraducoes === undefined) {
            continue;
          }

          for (const idioma of ['fr', 'en'] as const) {
            expect(
              armadilha.diagnosticoTraducoes[idioma]?.length ?? 0,
              `${nivel}: ${armadilha.diagnostico}`,
            ).toBeGreaterThan(20);
          }
        }
      }
    });
  }
});

describe('a leitura do texto por idioma', () => {
  const gerador = TODOS_OS_GERADORES.find(([topico]) => topico === 'razao-proporcao')![1];
  const exercicio = gerador.gerar('medio', criarRng(7));

  it('devolve a versão da língua pedida', () => {
    expect(enunciadoEm(exercicio, 'pt')).toBe(exercicio.enunciado);
    expect(enunciadoEm(exercicio, 'fr')).toBe(exercicio.traducoes?.fr?.enunciado);
    expect(enunciadoEm(exercicio, 'en')).toBe(exercicio.traducoes?.en?.enunciado);
  });

  it('cai no português quando o gerador ainda não traduziu', () => {
    const semTraducao: Exercicio<unknown> = { ...exercicio, traducoes: undefined };

    expect(enunciadoEm(semTraducao, 'fr')).toBe(exercicio.enunciado);
    expect(dicaEm(semTraducao, 'fr')).toBe(exercicio.dica);
    expect(formatoRespostaEm(gerador, 'en')).toBe('a number, e.g. 18 or 7.5');
    expect(formatoRespostaEm({ ...gerador, formatoRespostaTraducoes: undefined }, 'en')).toBe(
      gerador.formatoResposta,
    );
  });

  it('traduz o diagnóstico do erro que o aluno viu', () => {
    const armadilha = exercicio.armadilhas[0];
    const validacao = {
      veredito: 'incorreto' as const,
      mensagem: 'Não é isso.',
      diagnostico: armadilha.diagnostico,
      diagnosticoTraducoes: armadilha.diagnosticoTraducoes,
    };

    expect(diagnosticoEm(validacao, 'pt')).toBe(armadilha.diagnostico);
    expect(diagnosticoEm(validacao, 'fr')).toBe(armadilha.diagnosticoTraducoes?.fr);
  });
});
