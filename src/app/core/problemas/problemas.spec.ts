import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { NIVEIS, Nivel } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';
import { validarModelo } from '@core/problemas/validacao/validar-modelo';
import { vestirEnunciado } from '@core/problemas/vestir/vestir-enunciado';

/**
 * O guarda do mecanismo de histórias — e ele não chama LLM nenhuma.
 *
 * Um teste que depende de um modelo local no ar não é um teste: ele falharia
 * no CI de outra máquina por um motivo que não é defeito do código. O que se
 * confere aqui é o contrato entre o gerador e o serviço, que é a parte que
 * pode quebrar sem ninguém notar — a história errada aparece na tela, mas um
 * dado a menos aparece como `{2}` no meio da frase.
 */

const COM_HISTORIA = TODOS_OS_GERADORES.filter(
  ([, gerador]) => gerador.problemaDeTexto !== undefined,
);

describe('declaração de problema de texto', () => {
  it('há tópicos aderindo (senão este guarda não guarda nada)', () => {
    expect(COM_HISTORIA.length).toBeGreaterThan(0);
  });

  for (const [topicoId, gerador] of COM_HISTORIA) {
    const declaracao = gerador.problemaDeTexto!;

    describe(topicoId, () => {
      it('declara um dado para cada lacuna, sem buraco e sem repetição', () => {
        const indices = declaracao.pedido.dados.map((dado) => dado.indice).sort((a, b) => a - b);

        expect(indices).toEqual(indices.map((_, posicao) => posicao));
      });

      it('diz o que a pergunta cobra e o que a conta exercita', () => {
        expect(declaracao.pedido.pergunta.length, 'pergunta').toBeGreaterThan(5);
        expect(declaracao.pedido.oQueExercita.length, 'oQueExercita').toBeGreaterThan(5);
        expect(declaracao.pedido.topico.length, 'topico').toBeGreaterThan(2);
      });

      it('todo dado explica o que significa', () => {
        for (const dado of declaracao.pedido.dados) {
          expect(dado.significado.length, `{${dado.indice}}`).toBeGreaterThan(5);
        }
      });

      /**
       * O contrato da resposta, quando existe, existe nas três línguas: ele é
       * a parte do enunciado que o corretor cobra, e metade traduzida deixaria
       * o aluno em francês sem saber quantas casas dar.
       */
      it('o contrato da resposta vem nas três línguas', () => {
        const contrato = declaracao.contrato;

        if (contrato === undefined) {
          return;
        }

        expect(contrato.pt.length).toBeGreaterThan(2);
        expect(contrato.fr.length).toBeGreaterThan(2);
        expect(contrato.en.length).toBeGreaterThan(2);
      });

      /**
       * Quando o gerador manda dados, manda a quantidade declarada.
       *
       * É o erro que apareceria como `{2}` no meio do enunciado — e, pior,
       * apareceria só nos sorteios em que a história servisse.
       */
      it('os dados do exercício têm a quantidade declarada', () => {
        const esperado = declaracao.pedido.dados.length;
        let encontrados = 0;

        for (const nivel of NIVEIS as readonly Nivel[]) {
          const rng = criarRng(4242);

          for (let i = 0; i < 80; i += 1) {
            const exercicio = gerador.gerar(nivel, rng);
            const dados = exercicio.dadosDoProblema;

            if (dados === undefined) {
              continue;
            }

            encontrados += 1;
            expect(dados.length, `${nivel}: ${exercicio.enunciado}`).toBe(esperado);
            // Número finito, ou texto não vazio quando o dado é uma fórmula.
            expect(
              dados.every((valor) =>
                typeof valor === 'number' ? Number.isFinite(valor) : valor.trim().length > 0,
              ),
              `${nivel}: ${exercicio.enunciado}`,
            ).toBe(true);

            // O tipo declarado tem de bater com o que o gerador manda: uma
            // fórmula onde se esperava número viraria «3,5» no lugar de H₂O.
            declaracao.pedido.dados.forEach((dado) => {
              const valor = dados[dado.indice];
              const esperaTexto = dado.tipo === 'formula';

              expect(
                typeof valor === 'string',
                `{${dado.indice}} de ${nivel}: ${exercicio.enunciado}`,
              ).toBe(esperaTexto);
            });
          }
        }

        // Declarar história e nunca mandar dados seria declaração morta.
        expect(encontrados, 'nenhum exercício mandou dados').toBeGreaterThan(0);
      });

      /**
       * Com uma história de mentira, o enunciado vestido obedece às mesmas
       * regras dos enunciados escritos à mão: números na mesma ordem nos três
       * idiomas, separador decimal do idioma.
       */
      it('o enunciado vestido sai coerente nos três idiomas', () => {
        const lacunas = declaracao.pedido.dados.length;
        const historia = Array.from({ length: lacunas }, (_, i) => `{${i}}`).join(' e ');

        const modelo = validarModelo(
          {
            pt: `Numa situação de teste aparecem ${historia}. Qual é o valor pedido?`,
            fr: `Dans une situation de test apparaissent ${historia}. Quelle est la valeur demandée ?`,
            en: `In a test situation there appear ${historia}. What is the requested value?`,
          },
          lacunas,
        );

        expect(modelo.ok, 'a história de teste deveria passar pelo portão').toBe(true);

        if (!modelo.ok) {
          return;
        }

        // Os valores de teste respeitam o tipo declarado: fórmula entra como
        // texto, o resto como número com decimal, para conferir o separador.
        const valores = declaracao.pedido.dados
          .slice()
          .sort((a, b) => a.indice - b.indice)
          .map((dado, i) => (dado.tipo === 'formula' ? 'H2O' : i + 1.5));
        const numeros = (texto: string) =>
          [...texto.matchAll(/\d+(?:[.,]\d+)?/g)].map((achado) => achado[0].replace(',', '.'));

        const pt = vestirEnunciado(modelo.modelo, valores, 'pt', declaracao.contrato)!;
        const fr = vestirEnunciado(modelo.modelo, valores, 'fr', declaracao.contrato)!;
        const en = vestirEnunciado(modelo.modelo, valores, 'en', declaracao.contrato)!;

        expect(numeros(fr)).toEqual(numeros(pt));
        expect(numeros(en)).toEqual(numeros(pt));
        if (valores.some((valor) => typeof valor === 'number')) {
          expect(pt).toMatch(/\d,\d/);
          expect(en).toMatch(/\d\.\d/);
        }
      });
    });
  }
});
