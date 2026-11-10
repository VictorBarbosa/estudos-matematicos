import { CARREGAR_GERADOR } from '@core/treino/registro-geradores/registro-geradores';
import { NIVEIS, corrigir } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * O contrato das casas decimais, medido em todos os tópicos que o anunciam.
 *
 * O enunciado que promete «2 casas decimais» tem de aceitar a resposta com 2
 * casas — e, desde que o valor esteja certo, também a arredondada uma casa
 * antes, com o aviso da precisão. O que ele não pode é chamar de «não é isso»
 * uma conta que estava boa: isso manda refazer o que já estava certo.
 */
describe('casas decimais pedidas', () => {
  /*
   * O caso leva mais que os 5 s padrão.
   *
   * Ele carrega os 118 geradores e sorteia 100 exercícios em cada, corrigindo
   * cada resposta duas vezes — são ~12 mil correções. Sob instrumentação de
   * cobertura isso passa de 5 s, e o teste falhava por TEMPO, não por conta:
   * o recado dizia «Test timed out», e não «o tópico recusou a precisão». Um
   * limite explícito separa as duas coisas.
   */
  const TEMPO_LIMITE = 60_000;

  it(
    'aceitam a precisão que pedem, e uma casa a menos com aviso',
    async () => {
      const recusaOPedido: string[] = [];
      const recusaUmaAMenos: string[] = [];
      const semAviso: string[] = [];
      let conferidos = 0;

      for (const [topicoId, carregar] of Object.entries(CARREGAR_GERADOR)) {
        const gerador = await carregar();

        for (const nivel of NIVEIS) {
          const rng = criarRng(13);
          for (let i = 0; i < 25; i++) {
            const exercicio = gerador.gerar(nivel, rng);
            const casas = Number(/(\d+)\s+casas?/.exec(exercicio.enunciado)?.[1] ?? NaN);
            if (!Number.isFinite(casas) || casas < 1 || typeof exercicio.gabarito !== 'number') {
              continue;
            }

            conferidos++;
            const exato = exercicio.gabarito;
            const pedido = exato.toFixed(casas).replace('.', ',');
            const curto = exato.toFixed(casas - 1).replace('.', ',');

            if (corrigir(gerador, exercicio, pedido).veredito !== 'correto') {
              recusaOPedido.push(`${topicoId} (${casas}): ${pedido}`);
            }

            const validacao = corrigir(gerador, exercicio, curto);
            if (validacao.veredito !== 'correto') {
              recusaUmaAMenos.push(`${topicoId} (${casas}): ${curto} de ${exato}`);
            } else if (!gerador.saoEquivalentes(Number(curto.replace(',', '.')), exato)) {
              // Passou só pela regra do arredondamento curto: aí o aviso é
              // obrigatório. Quando a tolerância do próprio tópico já aceitava,
              // não há o que avisar.
              if (validacao.observacao === undefined) semAviso.push(`${topicoId} (${casas})`);
            }
          }
        }
      }

      expect(conferidos).toBeGreaterThan(200);
      expect([...new Set(recusaOPedido)]).toEqual([]);
      expect([...new Set(recusaUmaAMenos)]).toEqual([]);
      expect([...new Set(semAviso)]).toEqual([]);
    },
    TEMPO_LIMITE,
  );
});
