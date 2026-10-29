import { criarRng } from '@core/treino/rng';
import { NIVEIS } from '@core/treino/treino.model';
import { TODOS_OS_GERADORES } from './geradores.catalogo';


/**
 * Quantos exercícios distintos cada gerador precisa produzir.
 *
 * O número saiu de uma medição: antes desta trava, `seno-cosseno-tangente` no
 * nível fácil tinha SEIS exercícios no total — sorteava o ângulo de uma lista
 * de três — e o aluno reencontrava o mesmo enunciado em poucos cliques. O piso
 * fica abaixo do pior caso atual (82) para absorver variação de amostragem sem
 * deixar passar uma regressão real.
 */
const MINIMO_DISTINTOS = 60;

/** Amostras por tópico e nível. */
const AMOSTRAS = 1200;

/**
 * Folga de tempo por caso.
 *
 * O limite padrão do runner é de 5 s. Medir variedade custa 1200 sorteios, e
 * os geradores mais caros levam meio segundo nesta máquina — no runner de duas
 * CPUs da integração contínua, com os arquivos em paralelo, isso se multiplica.
 * Um caso que passe de 30 s está pendurado, não lento.
 */
const TEMPO_LIMITE = 30_000;

describe('variedade dos geradores', () => {
  for (const [topico, gerador] of TODOS_OS_GERADORES) {
    for (const nivel of NIVEIS) {
      it(
        `${topico} no nível ${nivel} produz exercícios variados`,
        () => {
          const vistos = new Set<string>();

          // Sementes fixas, porém distintas: o teste mede variedade sem ficar
          // instável entre execuções, como ficaria com semente aleatória.
          for (let sessao = 0; sessao < AMOSTRAS / 10; sessao++) {
            const rng = criarRng(sessao * 104_729 + 7);

            for (let k = 0; k < 10; k++) {
              const exercicio = gerador.gerar(nivel, rng);
              // O id carrega um sufixo aleatório de propósito; o que precisa
              // variar é o enunciado que o aluno lê.
              vistos.add(`${exercicio.enunciado}|${exercicio.enunciadoTex}`);
            }
          }

          expect(vistos.size).toBeGreaterThanOrEqual(MINIMO_DISTINTOS);
        },
        TEMPO_LIMITE,
      );
    }
  }
});
