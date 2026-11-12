import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { I18nService } from '@core/i18n/services/i18n.service';
import { Operador } from '@core/rascunho/models/peca/peca';
import { Peca } from '@core/rascunho/models/montagem/montagem';

/** O que uma tecla da bandeja faz. */
export type AcaoDaBandeja =
  | { readonly tipo: 'peca'; readonly peca: Peca }
  | { readonly tipo: 'apagar' }
  | { readonly tipo: 'subir' }
  | { readonly tipo: 'proximo' }
  | { readonly tipo: 'virar' };

interface Tecla {
  readonly rotulo: string;
  /** Sufixo da chave de tradução, em `rascunho.tecla.*`. */
  readonly nome: string;
  readonly acao: AcaoDaBandeja;
  readonly classe: string;
}

function algarismo(valor: string): Tecla {
  return {
    rotulo: valor,
    nome: `algarismo${valor}`,
    acao: { tipo: 'peca', peca: { tipo: 'algarismo', valor } },
    classe: 'digito',
  };
}

function operacao(rotulo: string, nome: string, operador: Operador): Tecla {
  return {
    rotulo,
    nome,
    acao: { tipo: 'peca', peca: { tipo: 'operacao', operador } },
    classe: 'operador',
  };
}

/**
 * As peças, numa grade fixa.
 *
 * **Não há peça composta.** Nada de «divida os dois lados por 2»: a peça é
 * átomo — algarismo, incógnita, operador, fração —, e é o aluno quem escolhe
 * qual e em que ordem. A única exceção é `▢x`, e ela não é composta por
 * esperteza: `2x` aparece em quase toda linha de álgebra, e pelo caminho geral
 * custaria três encaixes.
 *
 * `⬆`, `⇥` e `⇄` não são enfeite. `⬆` e `⇥` movem a seleção na árvore, e são o
 * que torna o monta monta usável sem precisão de polegar — alcançam o produto
 * implícito, que não tem sinal para tocar, e o buraco pequeno no fundo de uma
 * fração. `⇄` existe porque envolver `2x` com `−` só produz `2x − ▢`: sem ela,
 * `3 − 2x` não teria caminho nenhum.
 *
 * **Parêntese não está aqui.** Numa árvore o agrupamento já é a estrutura, e o
 * desenho o mostra pela precedência — oferecer `(` e `)` soltos permitiria
 * escrever parêntese desemparelhado, que não quer dizer nada.
 */
@Component({
  selector: 'app-rascunho-bandeja',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rascunho-bandeja.html',
  styleUrl: './rascunho-bandeja.scss',
})
export class RascunhoBandeja {
  readonly acionar = output<AcaoDaBandeja>();

  protected readonly i18n = inject(I18nService);

  /** A grade, lida de cima para baixo e da esquerda para a direita. */
  protected readonly teclas: readonly Tecla[] = [
    algarismo('7'),
    algarismo('8'),
    algarismo('9'),
    operacao('÷', 'dividir', '/'),
    {
      rotulo: '▭/▭',
      nome: 'fracao',
      acao: { tipo: 'peca', peca: { tipo: 'fracao' } },
      classe: 'estrutura',
    },
    { rotulo: '⬆', nome: 'subir', acao: { tipo: 'subir' }, classe: 'navegar' },

    algarismo('4'),
    algarismo('5'),
    algarismo('6'),
    operacao('×', 'multiplicar', '*'),
    {
      rotulo: '▢x',
      nome: 'coeficiente',
      acao: { tipo: 'peca', peca: { tipo: 'coeficiente' } },
      classe: 'estrutura',
    },
    { rotulo: '⇥', nome: 'proximo', acao: { tipo: 'proximo' }, classe: 'navegar' },

    algarismo('1'),
    algarismo('2'),
    algarismo('3'),
    operacao('+', 'somar', '+'),
    {
      rotulo: '=',
      nome: 'igualdade',
      acao: { tipo: 'peca', peca: { tipo: 'igualdade' } },
      classe: 'estrutura',
    },
    { rotulo: '⇄', nome: 'virar', acao: { tipo: 'virar' }, classe: 'navegar' },

    algarismo('0'),
    {
      rotulo: ',',
      nome: 'virgula',
      acao: { tipo: 'peca', peca: { tipo: 'virgula' } },
      classe: 'digito',
    },
    {
      rotulo: '±',
      nome: 'sinal',
      acao: { tipo: 'peca', peca: { tipo: 'sinal' } },
      classe: 'digito',
    },
    operacao('−', 'subtrair', '-'),
    {
      rotulo: 'x',
      nome: 'incognita',
      acao: { tipo: 'peca', peca: { tipo: 'incognita' } },
      classe: 'estrutura',
    },
    { rotulo: '⌫', nome: 'apagar', acao: { tipo: 'apagar' }, classe: 'navegar' },
  ];

  protected aoTocar(tecla: Tecla): void {
    this.acionar.emit(tecla.acao);
  }
}
