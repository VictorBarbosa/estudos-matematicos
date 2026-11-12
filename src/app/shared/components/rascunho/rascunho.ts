import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '@core/i18n/services/i18n.service';
import { Caminho } from '@core/rascunho/models/peca/peca';
import { RascunhoAberturaService } from '@core/rascunho/services/rascunho-abertura.service';
import { RascunhoService } from '@core/rascunho/services/rascunho.service';
import {
  AcaoDaBandeja,
  RascunhoBandeja,
} from '@shared/components/rascunho-bandeja/rascunho-bandeja';
import { RascunhoTabuleiro } from '@shared/components/rascunho-tabuleiro/rascunho-tabuleiro';

/**
 * A gaveta do monta monta, para quem estuda sem papel e sem onde escrever.
 *
 * Aparece **só no celular** — quem decide é o `DispositivoService`, no
 * cabeçalho. No tablet a folha à mão livre já resolve, e no computador há papel
 * na mesa; aqui o problema é outro: não há como escrever nem desenhar, então o
 * aluno encaixa peças.
 *
 * Uma altura só, de tela cheia. Duas alturas seria especificar o que talvez não
 * caiba, e a medida de quanto sobra abaixo do cabeçalho num iPhone de verdade
 * ainda não foi tomada — por isso o layout se adapta à altura que houver
 * (`dvh`, e a bandeja com piso) em vez de depender de um número fixo.
 *
 * Em paisagem ela pede para virar o aparelho: deitado sobram ~390 px de altura,
 * e o layout de duas colunas que caberia ali é de uma fase seguinte. Dizer isso
 * é mais honesto que entregar uma gaveta que não funciona.
 */
@Component({
  selector: 'app-rascunho',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RascunhoBandeja, RascunhoTabuleiro],
  templateUrl: './rascunho.html',
  styleUrl: './rascunho.scss',
})
export class Rascunho {
  protected readonly rascunho = inject(RascunhoService);
  protected readonly abertura = inject(RascunhoAberturaService);
  protected readonly i18n = inject(I18nService);

  protected readonly linhas = computed(() => this.rascunho.linhas().linhas);
  protected readonly atual = computed(() => this.rascunho.linhas().atual);

  /** O recado de uma ação recusada, ou vazio quando não houve recusa. */
  protected readonly aviso = computed(() => {
    const recusa = this.rascunho.recusa();

    // «Sem efeito» não merece recado: tocar numa peça que não aceita aquela
    // outra é tentativa, não erro, e um aviso a cada toque seria ruído.
    if (recusa === null || recusa === 'sem-efeito') {
      return '';
    }

    return this.i18n.t(`rascunho.recusa.${recusa}`);
  });

  protected selecaoDe(indice: number): Caminho | null {
    return indice === this.atual() ? this.rascunho.montagem().selecao : null;
  }

  protected aoAcionar(acao: AcaoDaBandeja): void {
    switch (acao.tipo) {
      case 'peca':
        this.rascunho.tocarPeca(acao.peca);
        return;
      case 'apagar':
        this.rascunho.apagarPeca();
        return;
      case 'subir':
        this.rascunho.subir();
        return;
      case 'proximo':
        this.rascunho.irAoProximo();
        return;
      case 'virar':
        this.rascunho.virar();
        return;
    }
  }

  protected aoEscolherPeca(indice: number, caminho: Caminho): void {
    if (indice !== this.atual()) {
      this.rascunho.escolher(indice);
    }

    this.rascunho.escolherPeca(caminho);
  }
}
