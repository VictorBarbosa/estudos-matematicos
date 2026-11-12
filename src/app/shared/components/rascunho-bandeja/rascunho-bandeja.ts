import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { I18nService } from '@core/i18n/services/i18n.service';
import { Operador } from '@core/rascunho/models/peca/peca';
import {
  Montagem,
  Peca,
  Recusa,
  apagar,
  encaixar,
  irAoProximoBuraco,
  subirNivel,
  virarLados,
} from '@core/rascunho/models/montagem/montagem';

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
  /** A linha em edição, para saber que peça pode agir sobre a seleção. */
  readonly montagem = input<Montagem | null>(null);

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

  /**
   * O que esta tecla faria, se tocada agora — por **ensaio com o próprio
   * modelo**, nunca por uma segunda cópia das regras. Por construção não há
   * como as duas discordarem.
   */
  private recusaDe(tecla: Tecla): Recusa | null {
    const montagem = this.montagem();
    if (montagem === null) {
      return null;
    }

    const acao = tecla.acao;

    switch (acao.tipo) {
      case 'peca':
        return encaixar(montagem, acao.peca).recusa;
      case 'apagar':
        return apagar(montagem).recusa;
      case 'subir':
        return subirNivel(montagem).recusa;
      case 'proximo':
        return irAoProximoBuraco(montagem).recusa;
      case 'virar':
        return virarLados(montagem).recusa;
    }
  }

  /**
   * Tecla muda, sem nada a explicar: desabilitada.
   *
   * `±` sobre um buraco, `⇄` sobre um número, `⬆` na raiz — todas davam
   * «sem efeito», e a tela engole essa recusa de propósito para não virar ruído
   * a cada toque. O resultado era uma bandeja com teclas que não respondiam e
   * nenhuma pista da regra. Desabilitar mostra a regra antes do toque.
   */
  protected impedida(tecla: Tecla): boolean {
    return this.recusaDe(tecla) === 'sem-efeito';
  }

  /**
   * Tecla que não cabe **por um motivo**: apagada, mas tocável.
   *
   * Aqui desabilitar seria pior. Uma igualdade dentro de outra conta, ou a
   * quarta fração aninhada, têm explicação — e botão desabilitado não pode ser
   * tocado, então o recado nunca apareceria. Apagada, a tecla avisa que algo
   * não cabe; tocada, ela diz por quê.
   */
  protected comMotivo(tecla: Tecla): boolean {
    const recusa = this.recusaDe(tecla);

    return recusa !== null && recusa !== 'sem-efeito';
  }

  protected aoTocar(tecla: Tecla): void {
    this.acionar.emit(tecla.acao);
  }
}
