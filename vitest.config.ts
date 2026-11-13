import { defineConfig } from 'vitest/config';

/**
 * Base de configuração do runner, estendida pelo builder do Angular.
 *
 * Existe por um motivo só: **o limite de tempo por teste**. O padrão do Vitest
 * é 5 s, e alguns guardas deste projeto medem muito de propósito — conferir 120
 * exercícios por integração numérica, amostrar 1 200 sorteios para medir
 * variedade, percorrer os 118 geradores atrás de dicas de estreia. Nesta
 * máquina o mais pesado leva 2,2 s; no runner de duas CPUs da integração
 * contínua, com duzentos arquivos em paralelo, isso passa dos 5 s e o deploy
 * cai — foi o que derrubou o commit `2f571d1`, num arquivo que a mudança
 * daquele commit nem tocava: ela só acrescentou carga ao mesmo runner.
 *
 * 30 s é o número que o projeto já usava nos dois guardas que traziam limite
 * próprio, com o mesmo raciocínio: um caso que passe disso está pendurado, não
 * lento. Aqui ele vale para todos, e deixa de ser lembrete espalhado.
 */
export default defineConfig({
  test: {
    testTimeout: 30_000,
  },
});
