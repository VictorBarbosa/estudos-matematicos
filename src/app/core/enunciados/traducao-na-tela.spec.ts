import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { NIVEIS } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * Quantos exercícios chegam à tela sem tradução.
 *
 * O texto dos enunciados foi escrito nas três línguas no arquivo, mas o
 * gerador precisa PEDIR as traduções: pedindo só o português, quem escolheu
 * francês lê a pergunta em português, e o trabalho de tradução fica guardado
 * sem servir a ninguém.
 *
 * Este guarda gera exercício de verdade e conta os que saem sem `fr`/`en`. O
 * número só pode descer.
 */

const SEMENTES = [3, 17, 91];

/**
 * Quantos tópicos ainda não mostram tradução.
 *
 * Eram 113 quando este guarda nasceu: o arquivo de enunciados tinha as três
 * línguas em todas as 7 924 entradas, e os geradores pediam só o português —
 * 488 chamadas em 111 geradores. A tradução existia e não chegava a ninguém.
 *
 * Caiu para 103 quando as chamadas passaram a pedir também `fr` e `en`, e para
 * 78 quando os geradores de OBJETO INTERMEDIÁRIO passaram a repassá-las.
 *
 * Esse segundo caso foi relatado em uso: «mesmo com os valores no JSON, não
 * muda quando troco de idioma». O gerador monta um `Pedido` com o texto e só
 * depois constrói o exercício; o campo de traduções não existia nesse objeto,
 * então o francês parava ali, escrito no arquivo e sem caminho até a tela.
 *
 * O que resta são os geradores cujo texto ainda vive no TypeScript, onde não
 * há o que pedir: para esses, traduzir é primeiro mover o texto para o
 * arquivo.
 */
const SEM_TRADUCAO_MAXIMO = 78;

describe('tradução na tela', () => {
  it('a conta de tópicos sem tradução só desce', () => {
    const semTraducao: string[] = [];

    for (const [topicoId, gerador] of TODOS_OS_GERADORES) {
      const falhou = NIVEIS.some((nivel) =>
        SEMENTES.some((semente) => {
          const exercicio = gerador.gerar(nivel, criarRng(semente));
          const fr = exercicio.traducoes?.fr?.enunciado;
          const en = exercicio.traducoes?.en?.enunciado;
          return fr === undefined || en === undefined;
        }),
      );

      if (falhou) {
        semTraducao.push(topicoId);
      }
    }

    expect(semTraducao.length, semTraducao.slice(0, 20).join(', ')).toBeLessThanOrEqual(
      SEM_TRADUCAO_MAXIMO,
    );
  });
});
