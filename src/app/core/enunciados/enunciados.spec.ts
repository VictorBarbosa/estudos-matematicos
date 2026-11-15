import { CURRICULO } from '@curriculo/curriculo';
import {
  CHAVES_RESERVADAS,
  CHAVE_DO_TOTAL,
  citadosEm,
  enunciadosDe,
  exercicioDoBanco,
  todosOsEnunciados,
  vestirTexto,
} from '@core/enunciados/models/enunciado.model';
import { TOPICOS_DO_BANCO } from '@core/enunciados/topicos-do-banco';
import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';
import { sortearDoBanco } from '@core/enunciados/models/enunciado.model';

/**
 * O guarda do banco de enunciados.
 *
 * O arquivo é editado à mão, por quem estuda, sem compilador olhando — então é
 * aqui que ele se defende. Cada teste fecha um jeito concreto de uma entrada
 * mal escrita chegar à tela: tópico que não existe, nível inventado, valor
 * citado no texto e ausente nos dados, idioma faltando, ordem dos números
 * diferente entre as línguas, e a pior de todas — o `total` errado, que
 * ensinaria a resposta errada com toda a confiança.
 */

const ENTRADAS = todosOsEnunciados();

const TOPICOS = new Set(CURRICULO.flatMap((area) => area.topicos.map((topico) => topico.id)));

const GERADORES = new Map(TODOS_OS_GERADORES);

describe('banco de enunciados', () => {
  it('há entradas (senão este guarda não guarda nada)', () => {
    expect(ENTRADAS.length).toBeGreaterThan(0);
  });

  it('a lista de tópicos do banco só cita tópicos do currículo', () => {
    for (const topico of TOPICOS_DO_BANCO) {
      expect(TOPICOS.has(topico), topico).toBe(true);
    }
  });

  /**
   * Quanto da lista já tem enunciado, e em que nível.
   *
   * Não é uma régua de qualidade: é o mapa do que falta escrever. Ele fica num
   * teste porque é a única forma de a contagem acompanhar o arquivo sem
   * ninguém atualizar um número à mão em lugar nenhum.
   */
  it('a cobertura da lista é conhecida', () => {
    const cobertos = new Set(ENTRADAS.map((entrada) => entrada.topico));
    const semNenhuma = TOPICOS_DO_BANCO.filter((topico) => !cobertos.has(topico));

    expect(cobertos.size + semNenhuma.length).toBe(TOPICOS_DO_BANCO.length);
  });

  for (const [indice, entrada] of ENTRADAS.entries()) {
    const nome = `${indice}: ${entrada.topico} / ${entrada.nivel}`;

    describe(nome, () => {
      it('aponta para um tópico que existe', () => {
        // Um id errado não quebra nada: a entrada simplesmente nunca aparece.
        // É o pior tipo de defeito, porque não se manifesta.
        expect(TOPICOS.has(entrada.topico), entrada.topico).toBe(true);
      });

      /**
       * E esse tópico está na lista que pode ter enunciado no banco.
       *
       * A lista é escolha de quem estuda, e há tópicos prontos fora dela. Sem
       * este teste, escrever uma entrada para um tópico de fora passaria —
       * silenciosamente, porque a entrada funcionaria.
       */
      it('está na lista de tópicos do banco', () => {
        expect(TOPICOS_DO_BANCO, entrada.topico).toContain(entrada.topico);
      });

      it('usa um dos quatro níveis do site', () => {
        expect(NIVEIS as readonly string[]).toContain(entrada.nivel);
      });

      it('traz o texto nas três línguas', () => {
        for (const idioma of ['br', 'fr', 'en'] as const) {
          expect(entrada.enunciado[idioma]?.trim().length, idioma).toBeGreaterThan(10);
        }
      });

      it('todo valor citado no texto existe nos dados', () => {
        const dados = entrada['dados-calculo'];

        for (const idioma of ['br', 'fr', 'en'] as const) {
          for (const citado of citadosEm(entrada.enunciado[idioma])) {
            expect(dados[citado], `${idioma}: {dados-calculo.${citado}}`).toBeDefined();
          }
        }
      });

      it('todo dado é usado, menos os reservados', () => {
        const dados = entrada['dados-calculo'];
        const citados = new Set(citadosEm(entrada.enunciado.br));

        for (const nome of Object.keys(dados)) {
          if (CHAVES_RESERVADAS.includes(nome)) {
            continue;
          }
          // Dado que não aparece no texto é dado que o aluno não recebe — e a
          // conta fica sem uma das pernas.
          expect(citados.has(nome), nome).toBe(true);
        }
      });

      it('tem total, e ele não aparece no texto', () => {
        const dados = entrada['dados-calculo'];

        expect(dados[CHAVE_DO_TOTAL], 'falta o total').toBeDefined();
        expect(citadosEm(entrada.enunciado.br)).not.toContain(CHAVE_DO_TOTAL);
      });

      /**
       * As três línguas citam os mesmos valores, na mesma ordem.
       *
       * É a mesma exigência que `textos-traduzidos.spec.ts` faz do resto do
       * site: trocar de idioma não pode trocar os números de lugar.
       */
      it('as três línguas citam os valores na mesma ordem', () => {
        const pt = citadosEm(entrada.enunciado.br).join(',');

        expect(citadosEm(entrada.enunciado.fr).join(','), 'fr').toBe(pt);
        expect(citadosEm(entrada.enunciado.en).join(','), 'en').toBe(pt);
      });

      /**
       * O `total` confere com a conta — quando a conta está declarada.
       *
       * Vale para as entradas que trazem `x1`, `acao` e `x2`: aí dá para
       * refazer a operação e comparar. Nas outras — área, MMC, proporção — a
       * conta não está no arquivo, e o teste seguinte (o do corretor) é o que
       * resta.
       */
      it('o total fecha a conta declarada', () => {
        const dados = entrada['dados-calculo'];
        const { x1, x2, acao } = dados;

        if (x1 === undefined || x2 === undefined || acao === undefined) {
          return;
        }

        const a = Number(x1);
        const b = Number(x2);
        const esperado =
          acao === '+'
            ? a + b
            : acao === '-'
              ? a - b
              : acao === '*'
                ? a * b
                : acao === '/'
                  ? a / b
                  : null;

        if (esperado === null) {
          return;
        }

        expect(Number(dados[CHAVE_DO_TOTAL]), `${x1} ${acao} ${x2}`).toBeCloseTo(esperado, 6);
      });

      /**
       * O tópico sabe ler o total, e o corretor aceita a própria resposta.
       *
       * É o teste que vale para TODA entrada, inclusive as que não declaram a
       * operação: se o corretor do tópico não aprova o `total` do arquivo, ou
       * o total está errado, ou está escrito num formato que o tópico não lê.
       */
      it('o corretor do tópico aceita o total', () => {
        const gerador = GERADORES.get(entrada.topico);

        expect(gerador, `sem gerador para ${entrada.topico}`).toBeDefined();

        if (gerador === undefined) {
          return;
        }

        const exercicio = exercicioDoBanco(gerador, entrada, indice);

        expect(exercicio, 'o tópico não soube ler o total').toBeDefined();

        if (exercicio === undefined) {
          return;
        }

        const escrito = gerador.formatar(exercicio.gabarito);

        expect(corrigir(gerador, exercicio, escrito).veredito, escrito).toBe('correto');
      });

      it('o texto vestido não deixa lacuna na tela', () => {
        const dados = entrada['dados-calculo'];

        for (const [idioma, texto] of [
          ['pt', entrada.enunciado.br],
          ['fr', entrada.enunciado.fr],
          ['en', entrada.enunciado.en],
        ] as const) {
          const vestido = vestirTexto(texto, dados, idioma);

          expect(vestido, idioma).not.toContain('{dados-calculo.');
        }
      });
    });
  }

  /**
   * O separador decimal é do idioma.
   *
   * O arquivo escreve «7.5» e o site mostra «7,5» em português e «7.5» em
   * inglês. Foi um defeito real do site em 13/11, em 12 pontos de 9
   * geradores, e um arquivo editado à mão repetiria o erro sem isto.
   */
  it('o número decimal sai com o separador de cada língua', () => {
    const dados = { medida: '7.5', total: '1' };
    const texto = 'Mede {dados-calculo.medida} metros.';

    expect(vestirTexto(texto, dados, 'pt')).toContain('7,5');
    expect(vestirTexto(texto, dados, 'fr')).toContain('7,5');
    expect(vestirTexto(texto, dados, 'en')).toContain('7.5');
  });

  /** O que não é número entra como está: `acao` guarda um sinal. */
  it('o que não é número entra literal', () => {
    expect(vestirTexto('{dados-calculo.acao}', { acao: '+', total: '1' }, 'pt')).toBe('+');
  });

  /**
   * O sorteio usa o rng da sessão, e por isso é reproduzível.
   *
   * É o que mantém a sessão repetível e os testes estáveis — `Math.random`
   * aqui faria o mesmo exercício virar outro entre duas execuções.
   */
  it('o sorteio é reproduzível com a mesma semente', () => {
    const topico = ENTRADAS[0]!.topico;
    const nivel = ENTRADAS[0]!.nivel as Nivel;
    const gerador = GERADORES.get(topico)!;

    const primeiro = sortearDoBanco(gerador, nivel, criarRng(7))?.enunciado;
    const segundo = sortearDoBanco(gerador, nivel, criarRng(7))?.enunciado;

    expect(primeiro).toBeDefined();
    expect(segundo).toBe(primeiro);
  });

  /**
   * Tópico sem entrada devolve indefinido, e o gerador segue dono do sorteio.
   *
   * O id é inventado de propósito: enquanto o banco cobria poucos tópicos,
   * este teste usava um tópico real que ainda não tinha entrada — e passou a
   * falhar no dia em que ele ganhou a sua. O que se quer provar aqui é o
   * caminho vazio, não qual tópico está vazio hoje.
   */
  it('tópico sem entrada devolve indefinido, e o gerador segue dono do sorteio', () => {
    const qualquer = GERADORES.get(ENTRADAS[0]!.topico)!;
    const foraDoBanco = { ...qualquer, topicoId: 'topico-que-nao-esta-no-banco' };

    expect(enunciadosDe(foraDoBanco.topicoId, 'facil')).toHaveLength(0);
    expect(sortearDoBanco(foraDoBanco, 'facil', criarRng(1))).toBeUndefined();
  });
});
