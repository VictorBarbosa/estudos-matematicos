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

/**
 * As sementes da varredura.
 *
 * Eram três, e três não bastavam: um gerador com seis ramos mostra cada um em
 * uma fração dos sorteios, e o ramo sem tradução simplesmente não saía. A
 * conta dizia 45 tópicos; com sessenta sementes eram 53. O guarda não estava
 * errado — estava olhando pouco.
 */
const SEMENTES = Array.from({ length: 60 }, (_, indice) => indice * 7 + 1);

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
 * Caiu para 46 com as chamadas de VÁRIAS LINHAS, que o primeiro script não
 * reconhecia: 115 delas, em 44 arquivos, pediam o texto ao molde e não
 * pediam as traduções.
 *
 * O que resta tem duas causas, e as duas exigem olhar o tópico:
 *
 * - o enunciado é montado como `molde + sufixo escrito em TypeScript`, e
 *   metade da frase não tem como ser traduzida;
 * - o enunciado está inteiro no TypeScript, muitas vezes com uma PALAVRA
 *   injetada — `Um ${NOME_FIGURA[figura]} tem base…`. Áreas de figuras planas
 *   mostra a saída: um molde por figura, com o nome já escrito nas três
 *   línguas, em vez de um molde com o nome vindo pronto em português.
 */
/*
 * ZERO, e daqui não sobe.
 *
 * Foram 113 tópicos, depois 53 quando a varredura passou a olhar sessenta
 * sementes em vez de três, e agora nenhum: todo gerador do site entrega o
 * enunciado nas três línguas, em todos os níveis e em todos os ramos.
 *
 * O que fechou a conta não foi traduzir texto — o texto já estava traduzido
 * nos moldes —, foi tirar do TypeScript as três coisas que o molde não
 * alcançava: o SUFIXO colado ao fim da frase («Responda como fração.»), a
 * PALAVRA escolhida por um `if` («o dobro», «cilindro», «esquerda») e a
 * HISTÓRIA inteira escrita em código (os cenários dos sistemas lineares).
 *
 * Cada um ganhou o seu caminho: `enunciadoComSufixos` junta a pergunta e os
 * sufixos pelo arquivo; um molde por variação resolve a palavra escolhida; e
 * `enunciadoDoMoldePorIdioma` dá à mesma lacuna o valor de cada língua, para
 * quando as variações são dezenas — as grandezas da análise dimensional são
 * vinte e três.
 *
 * Este guarda só desce. Se ele subir, é um ramo novo que nasceu falando só
 * português.
 */
const SEM_TRADUCAO_MAXIMO = 0;

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
