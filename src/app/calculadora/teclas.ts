import { EstadoCalculadora } from '@core/calculadora/models/calculadora.model';

/**
 * O que uma tecla faz.
 *
 * Copiado do site, sem mudança: a mecânica da calculadora é a mesma, e o que
 * muda aqui é só a moldura — uma página inteira em vez de uma janela
 * flutuante, e um menu lateral no lugar das abas.
 */
export type Acao =
  | { readonly tipo: 'inserir'; readonly texto: string }
  | { readonly tipo: 'limpar' }
  | { readonly tipo: 'apagar' }
  | { readonly tipo: 'igual' }
  | { readonly tipo: 'sinal' }
  | { readonly tipo: 'porcento' }
  | { readonly tipo: 'inverso' }
  | { readonly tipo: 'angulo' };

export interface Tecla {
  readonly rotulo: string;
  /** Pinta a tecla: cinza-claro para função, laranja para operação. */
  readonly estilo: 'digito' | 'funcao' | 'operador';
  readonly acao: Acao;
  /** O zero ocupa duas colunas, como no iPhone. */
  readonly largo?: boolean;
  /** Nome falado pelo leitor de tela, quando o rótulo é um símbolo. */
  readonly nome?: string;
}

const inserir = (texto: string): Acao => ({ tipo: 'inserir', texto });

/** O teclado de sempre: quatro colunas, operações à direita. */
export const BASICAS: readonly Tecla[] = [
  { rotulo: 'AC', estilo: 'funcao', acao: { tipo: 'limpar' }, nome: 'limpar' },
  { rotulo: '±', estilo: 'funcao', acao: { tipo: 'sinal' }, nome: 'trocar o sinal' },
  { rotulo: '%', estilo: 'funcao', acao: { tipo: 'porcento' }, nome: 'por cento' },
  { rotulo: '÷', estilo: 'operador', acao: inserir('÷'), nome: 'dividir' },

  { rotulo: '7', estilo: 'digito', acao: inserir('7') },
  { rotulo: '8', estilo: 'digito', acao: inserir('8') },
  { rotulo: '9', estilo: 'digito', acao: inserir('9') },
  { rotulo: '×', estilo: 'operador', acao: inserir('×'), nome: 'multiplicar' },

  { rotulo: '4', estilo: 'digito', acao: inserir('4') },
  { rotulo: '5', estilo: 'digito', acao: inserir('5') },
  { rotulo: '6', estilo: 'digito', acao: inserir('6') },
  { rotulo: '−', estilo: 'operador', acao: inserir('-'), nome: 'subtrair' },

  { rotulo: '1', estilo: 'digito', acao: inserir('1') },
  { rotulo: '2', estilo: 'digito', acao: inserir('2') },
  { rotulo: '3', estilo: 'digito', acao: inserir('3') },
  { rotulo: '+', estilo: 'operador', acao: inserir('+'), nome: 'somar' },

  { rotulo: '0', estilo: 'digito', acao: inserir('0'), largo: true },
  { rotulo: ',', estilo: 'digito', acao: inserir(','), nome: 'vírgula' },
  { rotulo: '=', estilo: 'operador', acao: { tipo: 'igual' }, nome: 'calcular' },
];

/** A ala científica: três colunas que aparecem acima das de sempre. */
export const CIENTIFICAS: readonly Tecla[] = [
  { rotulo: 'sin', estilo: 'funcao', acao: inserir('sin('), nome: 'seno' },
  { rotulo: 'ln', estilo: 'funcao', acao: inserir('ln('), nome: 'logaritmo natural' },
  { rotulo: 'π', estilo: 'funcao', acao: inserir('π'), nome: 'pi' },

  { rotulo: 'cos', estilo: 'funcao', acao: inserir('cos('), nome: 'cosseno' },
  { rotulo: 'log', estilo: 'funcao', acao: inserir('log('), nome: 'logaritmo decimal' },
  { rotulo: 'e', estilo: 'funcao', acao: inserir('e'), nome: 'número de Euler' },

  { rotulo: 'tan', estilo: 'funcao', acao: inserir('tan('), nome: 'tangente' },
  { rotulo: '√', estilo: 'funcao', acao: inserir('√('), nome: 'raiz quadrada' },
  { rotulo: 'x²', estilo: 'funcao', acao: inserir('^2'), nome: 'ao quadrado' },

  { rotulo: '1/x', estilo: 'funcao', acao: { tipo: 'inverso' }, nome: 'inverso' },
  { rotulo: 'xʸ', estilo: 'funcao', acao: inserir('^'), nome: 'elevado a' },
  { rotulo: 'x³', estilo: 'funcao', acao: inserir('^3'), nome: 'ao cubo' },

  { rotulo: 'RAD', estilo: 'funcao', acao: { tipo: 'angulo' }, nome: 'unidade de ângulo' },
  { rotulo: '(', estilo: 'funcao', acao: inserir('('), nome: 'abre parêntese' },
  { rotulo: ')', estilo: 'funcao', acao: inserir(')'), nome: 'fecha parêntese' },
];

/** `AC` enquanto não há nada escrito, `C` depois — como no iPhone. */
export function rotuloLimpar(estado: EstadoCalculadora): string {
  return estado.expressao === '' && estado.resultado === null ? 'AC' : 'C';
}
