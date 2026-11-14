import type { ProblemaDeTexto } from '@core/problemas/models/problema-de-texto';

/**
 * A declaração que permite a este tópico receber histórias de uma LLM local.
 *
 * Fica em arquivo próprio, e com `import type`, por um motivo prático: assim
 * `scripts/comparar-modelos.ts` a importa por caminho relativo e mede **esta**
 * declaração, não uma cópia. A cópia desanda — foi o que aconteceu antes, e
 * medir o prompt errado é pior que não medir.
 */
/**
 * Só a PA de razão positiva recebe história.
 *
 * A PG multiplica, e uma história de crescimento multiplicativo pede outra
 * relação; a PA de razão negativa pede um contexto que diminui, e misturar as
 * duas daria «cada mês acrescenta −4 caixas», que ninguém escreve assim. Vale
 * a pena cobrir um caso bem do que três mal.
 */
export const PROBLEMA_PA: ProblemaDeTexto = {
  forma: 'pa-termo',
  pedido: {
    topico: 'Progressão aritmética',
    oQueExercita: 'achar o n-ésimo termo de uma PA: a_n = a_1 + (n − 1)·r',
    relacao:
      'uma quantidade começa em {0} e cresce {1} a cada passo; a pergunta é quanto ela vale ' +
      'no passo número {2} — contando o começo como o passo 1',
    dados: [
      { indice: 0, significado: 'o valor no primeiro passo', tipo: 'inteiro', faixa: [1, 12] },
      {
        indice: 1,
        significado: 'quanto se acrescenta a cada passo seguinte, na mesma unidade do valor',
        tipo: 'inteiro',
        faixa: [3, 7],
      },
      {
        indice: 2,
        significado: 'o número do passo sobre o qual se pergunta',
        tipo: 'inteiro',
        faixa: [5, 20],
      },
    ],
    pergunta: 'quanto vale a quantidade no passo pedido',
    contextos: [
      'produção que aumenta por mês',
      'degraus de uma escada',
      'fileiras de um auditório',
      'salário com aumento fixo',
      'caixas empilhadas por camada',
    ],
  },
};
