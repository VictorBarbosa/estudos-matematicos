/**
 * A máscara do campo de resposta: o número aparece como foi entendido.
 *
 * O aluno digitava `6.082.12` e o corretor lia outra coisa — erro que não é de
 * matemática, é de separador. A máscara fecha essa fresta pelo único jeito que
 * não mente: ela reescreve o que foi digitado usando a MESMA regra de leitura
 * do corretor (ver `COM_MILHAR` em `resposta-numerica`), de modo que o que
 * está na tela e o que vai ser corrigido são, por construção, a mesma coisa.
 *
 * Fora do número puro ela não encosta: fração, raiz, intervalo, notação
 * científica e qualquer coisa com letra passam intactas.
 */

/** Só dígitos, sinal e separadores — o resto não é número, é expressão. */
const SO_NUMERO = /^[+-]?[\d.,]*$/;

/**
 * O formato que já significa milhar: grupos exatos de três.
 *
 * O primeiro grupo começa em 1 porque ninguém escreve zero milhares — é a
 * mesma razão que faz `0.833` ser decimal no corretor.
 */
const COM_MILHAR = /^[1-9]\d{0,2}(?:\.\d{3})+$/;

/** O número escrito à maneira daqui: milhar com ponto, decimal com vírgula. */
export function mascararNumero(entrada: string): string {
  if (!SO_NUMERO.test(entrada) || entrada === '') {
    return entrada;
  }

  const sinal = entrada.startsWith('-') ? '-' : entrada.startsWith('+') ? '+' : '';
  const corpo = sinal === '' ? entrada : entrada.slice(1);
  if (corpo === '') {
    return entrada;
  }

  const partes = separar(corpo);
  if (partes === null) {
    return entrada;
  }

  const agrupada = agrupar(partes.inteira);
  const { decimal } = partes;

  // `decimal` é `null` quando não há separador, e `''` quando ele acabou de
  // ser digitado: `6,` precisa continuar `6,` para a próxima tecla.
  return decimal === null ? `${sinal}${agrupada}` : `${sinal}${agrupada},${decimal}`;
}

/**
 * Separa a parte inteira da decimal, decidindo qual separador é qual.
 *
 * Devolve `null` quando ainda não dá para decidir. Um ponto sozinho com menos
 * de três dígitos depois é genuinamente ambíguo — `6.0` tanto pode virar
 * `6.082` (milhar) quanto ser 6,0 —, e a máscara prefere não mexer a chutar e
 * ter de voltar atrás na tecla seguinte. O corretor lê os dois casos, então
 * ficar pendente não custa nada.
 */
function separar(corpo: string): { inteira: string; decimal: string | null } | null {
  const virgula = corpo.indexOf(',');

  // Com vírgula não há dúvida: ela é o decimal, e todo ponto é milhar.
  if (virgula !== -1) {
    return {
      inteira: corpo.slice(0, virgula).replace(/\./g, ''),
      decimal: corpo.slice(virgula + 1).replace(/[.,]/g, ''),
    };
  }

  const pontos = corpo.split('.').length - 1;
  if (pontos === 0) {
    return { inteira: corpo, decimal: null };
  }

  /*
   * Dois pontos não existem em convenção nenhuma: o último é o decimal.
   * `6.082.12` é alguém escrevendo 6082,12 com a mão trocada, e era
   * exatamente esse o erro que a máscara existe para apagar.
   */
  if (pontos >= 2) {
    const ultimo = corpo.lastIndexOf('.');
    return {
      inteira: corpo.slice(0, ultimo).replace(/\./g, ''),
      decimal: corpo.slice(ultimo + 1),
    };
  }

  const ponto = corpo.indexOf('.');
  const antes = corpo.slice(0, ponto);
  const depois = corpo.slice(ponto + 1);

  // Ninguém escreve zero milhares: `0.833` só pode ser decimal.
  if (antes.startsWith('0') || antes === '') {
    return { inteira: antes, decimal: depois };
  }

  // Três ou mais dígitos depois do ponto: é milhar, e o resto é continuação.
  if (depois.length >= 3) {
    return { inteira: corpo.replace(/\./g, ''), decimal: null };
  }

  // Milhar vem sempre depois de um a três dígitos. Com mais do que isso na
  // frente, o ponto só pode ser decimal: `6082.12` é 6082,12.
  if (antes.length > 3) {
    return { inteira: antes, decimal: depois };
  }

  return null;
}

/** `6082` vira `6.082`; abaixo de quatro dígitos nada muda. */
function agrupar(inteira: string): string {
  const semZeroInutil = inteira.replace(/^0+(?=\d)/, '');
  return semZeroInutil.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Onde o cursor deve ficar depois da máscara.
 *
 * Contando dígitos, e não caracteres: a máscara insere e remove pontos à
 * esquerda do cursor, e contar caracteres faria o cursor pular de lugar a cada
 * milhar que nasce.
 */
export function cursorNaMascara(mascarado: string, digitosAntes: number): number {
  if (digitosAntes <= 0) {
    return mascarado.startsWith('-') || mascarado.startsWith('+') ? 1 : 0;
  }

  let vistos = 0;
  for (let i = 0; i < mascarado.length; i++) {
    if (/\d/.test(mascarado[i]!)) {
      vistos++;
      if (vistos === digitosAntes) {
        return i + 1;
      }
    }
  }

  return mascarado.length;
}

/** Quantos dígitos existem antes desta posição. */
export function digitosAte(texto: string, posicao: number): number {
  return (texto.slice(0, posicao).match(/\d/g) ?? []).length;
}
