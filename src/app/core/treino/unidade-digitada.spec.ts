import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { NIVEIS, corrigir } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * A unidade que o enunciado pede pode vir escrita na resposta.
 *
 * «Qual é a velocidade, em m/s?» e o aluno responde «547,72 m/s». Escrever a
 * unidade é o que a escola ensina e o que qualquer professor aceitaria — e o
 * site respondia **«Não consegui ler essa resposta»**, porque o analisador de
 * número para no primeiro caractere que não é número, e o «inválido» era
 * decidido antes de qualquer segunda leitura.
 *
 * Medido quando isto foi escrito: **39 dos 118 tópicos** recusavam a unidade
 * que eles próprios pediam no enunciado. Não era um tópico distraído, era o
 * corretor.
 *
 * O teste usa o gabarito na forma em que o site o EXIBE (`formatar`), mais a
 * unidade que o enunciado pede. É a resposta que o aluno copiaria da tela,
 * então recusá-la é indefensável — e é mais estrito que inventar um
 * arredondamento próprio, que mediria precisão em vez de leitura.
 */

/** A unidade pedida no enunciado, quando ele diz «em …». */
const UNIDADE_PEDIDA = /\(?em (cm²|cm³|cm|m\/s²|m\/s|m²|m³|m|km|graus|kg|s|N|J|W|V|A|Ω|rad)\b/;

const AMOSTRAS = 25;

describe('a unidade escrita na resposta', () => {
  for (const [topico, gerador] of TODOS_OS_GERADORES) {
    it(`${topico}: aceita o gabarito com a unidade do enunciado`, () => {
      const rng = criarRng(909);
      const recusados: string[] = [];
      let conferidos = 0;

      for (const nivel of NIVEIS) {
        for (let i = 0; i < AMOSTRAS; i++) {
          const exercicio = gerador.gerar(nivel, rng);
          const unidade = UNIDADE_PEDIDA.exec(exercicio.enunciado)?.[1];

          if (unidade === undefined) {
            continue;
          }

          conferidos++;
          const comUnidade = `${gerador.formatar(exercicio.gabarito)} ${unidade}`;

          if (corrigir(gerador, exercicio, comUnidade).veredito !== 'correto') {
            recusados.push(`[${nivel}] ${comUnidade} — ${exercicio.enunciado.slice(0, 60)}`);
          }
        }
      }

      expect([...new Set(recusados)].slice(0, 3).join('\n'), `${topico}: ${conferidos}`).toBe('');
    });
  }
});
