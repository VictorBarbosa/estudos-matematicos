import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { NIVEIS } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * Nenhum enunciado chega à tela com lacuna.
 *
 * Esta é a prova que faltava ao arquivo de enunciados. Um molde diz
 * «{dados-calculo.constante}» e NÃO diz de onde vem `constante` — quem fornece
 * é o gerador, a cada sorteio. Lendo só o JSON não dá para saber se ele
 * fornece; e se não fornecer, o aluno vê a lacuna crua no meio da pergunta,
 * sem que nada quebre: sem erro de compilação, sem exceção, sem teste
 * vermelho.
 *
 * Então o guarda gera exercício de verdade — todos os tópicos, todos os
 * níveis, várias sementes — e exige que o texto que iria à tela não tenha
 * sobrado nenhuma lacuna, em nenhuma das três línguas. É o teste que falha no
 * dia em que alguém renomear uma chave no JSON e esquecer o gerador, ou
 * acrescentar uma lacuna que ninguém preenche.
 */

/** Sementes diferentes porque cada uma cai num ramo diferente do gerador. */
const SEMENTES = [1, 7, 13, 29, 101, 997];

describe('lacunas preenchidas', () => {
  for (const [topicoId, gerador] of TODOS_OS_GERADORES) {
    describe(topicoId, () => {
      for (const nivel of NIVEIS) {
        it(`${nivel}: nenhum texto sai com lacuna`, () => {
          for (const semente of SEMENTES) {
            const exercicio = gerador.gerar(nivel, criarRng(semente));

            const textos = [
              ['enunciado', exercicio.enunciado],
              ['dica', exercicio.dica ?? ''],
              ['fr', exercicio.traducoes?.fr?.enunciado ?? ''],
              ['fr.dica', exercicio.traducoes?.fr?.dica ?? ''],
              ['en', exercicio.traducoes?.en?.enunciado ?? ''],
              ['en.dica', exercicio.traducoes?.en?.dica ?? ''],
            ] as const;

            for (const [onde, texto] of textos) {
              expect(
                texto,
                `${topicoId}/${nivel} semente ${semente} (${onde}): ${texto}`,
              ).not.toContain('{dados-calculo.');
            }
          }
        });
      }
    });
  }
});
