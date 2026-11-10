import { Idioma } from '@core/i18n/models/i18n.model';
import { TextoDoExercicio } from '@core/treino/models/treino.model';

/**
 * Um enunciado escrito nas três línguas.
 *
 * **Por que uma função, e não uma string.** O enunciado de um exercício carrega
 * os números sorteados, e cada língua os encaixa numa ordem de palavras
 * diferente: «3 kg custam R$ 24» vira «3 kg coûtent 24 $» e «3 kg cost $24»,
 * com o símbolo da moeda em posição distinta e o plural mudando junto com o
 * número. Concatenar pedaços traduzidos produziria frases tortas em duas das
 * três línguas — por isso a frase inteira é escrita, e o número entra como
 * argumento.
 *
 * **Por que três campos e não um mapa.** Com `pt`, `fr` e `en` como
 * propriedades obrigatórias, o TypeScript recusa uma frase que esqueceu uma
 * língua. Um `Record<Idioma, string>` faria o mesmo, mas perderia o tipo dos
 * argumentos de cada molde — que é justamente o que pega o erro de passar os
 * números na ordem errada.
 */
export type Molde<A extends readonly unknown[]> = (...argumentos: A) => string;

export interface Frases<A extends readonly unknown[]> {
  readonly pt: Molde<A>;
  readonly fr: Molde<A>;
  readonly en: Molde<A>;
}

/** O resultado da montagem: o que vai para o campo `enunciado` e o que vai para `traducoes`. */
export interface EnunciadoTrilingue {
  readonly enunciado: string;
  /**
   * A dica em português.
   *
   * Fica aqui, e não só em `traducoes`, porque `Exercicio.dica` é o campo que
   * os guardas do projeto leem — «toda forma de pergunta tem dica no nível em
   * que estreia». Sem ela, cada história nova reprovaria a suíte por um motivo
   * que a própria história já resolve.
   */
  readonly dica?: string;
  readonly traducoes: Readonly<Partial<Record<Idioma, TextoDoExercicio>>>;
}

/**
 * Monta o enunciado em português e as duas traduções, com os mesmos números.
 *
 * A dica acompanha quando existe: uma dica em português num enunciado em
 * francês entrega que a tradução foi pela metade, e é o primeiro lugar em que o
 * aluno tropeça.
 */
export function enunciadoTrilingue<A extends readonly unknown[]>(
  frases: Frases<A>,
  argumentos: A,
  dicas?: Frases<A>,
): EnunciadoTrilingue {
  return {
    enunciado: frases.pt(...argumentos),
    dica: dicas?.pt(...argumentos),
    traducoes: {
      fr: { enunciado: frases.fr(...argumentos), dica: dicas?.fr(...argumentos) },
      en: { enunciado: frases.en(...argumentos), dica: dicas?.en(...argumentos) },
    },
  };
}

/**
 * Um diagnóstico de erro nas três línguas, como `traducoes` da validação.
 *
 * Recebe moldes porque o diagnóstico quase sempre cita os números do
 * exercício — «dividir por −3 inverte o sentido» perde o sentido quando o
 * coeficiente é outro.
 */
export function diagnosticoTrilingue<A extends readonly unknown[]>(
  frases: Frases<A>,
  argumentos: A,
): { diagnostico: string; diagnosticoTraducoes: Readonly<Record<'fr' | 'en', string>> } {
  return {
    diagnostico: frases.pt(...argumentos),
    diagnosticoTraducoes: { fr: frases.fr(...argumentos), en: frases.en(...argumentos) },
  };
}
