import { criarRng } from '@core/treino/rng/rng';
import { Exercicio, GeradorExercicio, NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';

/**
 * Travas de formato, para os 75 geradores de uma vez.
 *
 * São elas que pegam a classe de bug mais traiçoeira do site: o aluno resolve
 * certo e é reprovado porque o gabarito não é digitável no formato aceito, ou
 * porque a tolerância de correção não corresponde ao arredondamento que o
 * próprio enunciado manda dar.
 */

/**
 * Amostras por tópico e nível.
 *
 * 120 sorteios já exercitam todos os tipos de pergunta de cada gerador; o
 * dobro disso só fazia a suíte chegar perto do limite de tempo no runner de
 * duas CPUs da integração contínua.
 */
const AMOSTRAS = 120;

/** Folga para máquinas lentas: falhar por tempo aqui seria só ruído. */
const TEMPO_LIMITE = 30_000;

function amostra(gerador: GeradorExercicio<unknown>, nivel: Nivel): readonly Exercicio<unknown>[] {
  const rng = criarRng(20_261_028);
  return Array.from({ length: AMOSTRAS }, () => gerador.gerar(nivel, rng));
}

/**
 * Todos os valores que um passo da resolução exibe.
 *
 * O LaTeX escreve o separador decimal como `{,}` ou `,` e o de milhar como
 * `\\,`. Além disso, um passo pode mostrar o resultado como fração
 * (`\frac{1}{81}`) ou como porcentagem (`70\%`) — formas que o aluno lê como
 * sendo a resposta, e que por isso contam.
 */
function numerosDe(passo: { readonly tex: string; readonly nota?: string }): readonly number[] {
  const texto = `${passo.tex} ${passo.nota ?? ''}`
    .replace(/\{,\}/g, ',')
    .replace(/\\[,!;:]/g, '');

  const valores: number[] = [];

  for (const achado of texto.matchAll(/-?\d+(?:[.,]\d+)?(?:e[+-]?\d+)?/gi)) {
    valores.push(Number(achado[0].replace(',', '.')));
  }

  for (const achado of texto.matchAll(/\\frac\{(-?\d+(?:[.,]\d+)?)\}\{(-?\d+(?:[.,]\d+)?)\}/g)) {
    const numerador = Number(achado[1]!.replace(',', '.'));
    const denominador = Number(achado[2]!.replace(',', '.'));
    if (denominador !== 0) {
      valores.push(numerador / denominador);
    }
  }

  for (const achado of texto.matchAll(/(-?\d+(?:[.,]\d+)?)\s*\\%/g)) {
    valores.push(Number(achado[1]!.replace(',', '.')) / 100);
  }

  // "1.072,5" tem ponto de milhar; "0.292" tem ponto decimal. As duas formas
  // aparecem nos passos, e aqui não há como distingui-las com certeza — então
  // as duas leituras entram como candidatas.
  for (const achado of texto.matchAll(/-?\d{1,3}(?:\.\d{3})+(?:,\d+)?(?![\d.])/g)) {
    valores.push(Number(achado[0].replace(/\./g, '').replace(',', '.')));
  }

  return valores;
}

/** As casas decimais que o enunciado pede, quando ele pede alguma. */
function casasPedidas(enunciado: string): number | null {
  const comNumero = /(\d+)\s*casas?\s*decima/i.exec(enunciado);
  if (comNumero) {
    return Number(comNumero[1]);
  }
  return /uma casa decimal/i.test(enunciado) ? 1 : null;
}

describe('formato das respostas', () => {
  for (const [topico, gerador] of TODOS_OS_GERADORES) {
    for (const nivel of NIVEIS) {
      it(
        `${topico} / ${nivel}: o gabarito é aceito na forma em que é exibido`,
        () => {
          for (const exercicio of amostra(gerador, nivel)) {
            const exibido = gerador.formatar(exercicio.gabarito);
            const lido = gerador.analisar(exibido);

            expect(lido, `${topico}: "${exibido}" não foi reconhecido`).not.toBeNull();
            expect(gerador.saoEquivalentes(lido!, exercicio.gabarito), `${topico}: "${exibido}" não equivale ao gabarito`).toBe(true);
          }
        },
        TEMPO_LIMITE,
      );

      it(
        `${topico} / ${nivel}: a resolução termina no gabarito`,
        () => {
          for (const exercicio of amostra(gerador, nivel)) {
            expect(gerador.saoEquivalentes(exercicio.resolucao.resultado, exercicio.gabarito), `${topico}: a resolução conclui ${gerador.formatar(
                exercicio.resolucao.resultado,
              )} e o gabarito é ${gerador.formatar(exercicio.gabarito)}`).toBe(true);
          }
        },
        TEMPO_LIMITE,
      );

      it(
        `${topico} / ${nivel}: o último passo da resolução mostra o gabarito`,
        () => {
          for (const exercicio of amostra(gerador, nivel)) {
            if (typeof exercicio.gabarito !== 'number') {
              continue;
            }

            // Os dois últimos passos: alguns tópicos fecham com uma conclusão
            // em palavras depois da conta.
            const passos = exercicio.resolucao.passos;
            const finais = passos.slice(-2);

            expect(finais.some((passo) =>
                numerosDe(passo).some((valor) =>
                  gerador.saoEquivalentes(valor, exercicio.gabarito as never),
                ),
              ), `${topico}: o fim da resolução não mostra ` +
                `${gerador.formatar(exercicio.gabarito)} — "${passos.at(-1)?.tex}"`).toBe(true);
          }
        },
        TEMPO_LIMITE,
      );

      it(
        `${topico} / ${nivel}: o arredondamento pedido no enunciado é aceito`,
        () => {
          for (const exercicio of amostra(gerador, nivel)) {
            const casas = casasPedidas(exercicio.enunciado);
            if (casas === null || typeof exercicio.gabarito !== 'number') {
              continue;
            }

            const arredondado = exercicio.gabarito.toFixed(casas).replace('.', ',');
            const veredito = corrigir(gerador, exercicio, arredondado).veredito;

            expect(veredito, `${topico}: o enunciado pede ${casas} casas, mas "${arredondado}" foi ${veredito}`).toBe('correto');
          }
        },
        TEMPO_LIMITE,
      );
    }
  }
});
