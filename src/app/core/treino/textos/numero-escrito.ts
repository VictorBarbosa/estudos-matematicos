import { Idioma } from '@core/i18n/models/i18n.model';

/**
 * Um número como ele se escreve dentro de uma frase.
 *
 * `${valor}` num template devolve a forma do JavaScript, que usa ponto
 * decimal — e num site em português isso aparece como «Um círculo tem área
 * 452.39 cm²». O aluno lê um número que não é o que escreveríamos à mão, e no
 * campo de resposta ele digita com vírgula.
 *
 * **O separador é do idioma, não do site.** Português e francês usam vírgula;
 * inglês usa ponto. Por isso a função recebe o idioma: um enunciado traduzido
 * que leve a vírgula para o inglês fica tão errado quanto o ponto no
 * português — e foi o que aconteceu nas primeiras traduções de Semelhança e
 * Pitágoras.
 *
 * Sem separador de milhar, de propósito. Aqui o número é um dado do enunciado,
 * e «1.000» num texto em português se confunde com «1,000» em inglês; quem
 * precisa de milhar é a exibição do gabarito, que tem `formatarNumero`.
 */
export function numeroEscrito(valor: number, idioma: Idioma): string {
  const cru = String(valor);

  return idioma === 'en' ? cru : cru.replace('.', ',');
}

/** O mesmo, para os geradores que ainda só falam português. */
export function numeroEmPortugues(valor: number): string {
  return numeroEscrito(valor, 'pt');
}
