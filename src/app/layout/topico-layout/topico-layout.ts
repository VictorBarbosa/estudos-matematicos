import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { PainelEtapa } from '@shared/components/painel-etapa/painel-etapa';
import { PainelProgresso } from '@shared/components/painel-progresso/painel-progresso';

export type AbaTopico = 'explorar' | 'treinar';

const ABAS: readonly AbaTopico[] = ['explorar', 'treinar'];

/**
 * Moldura comum a todos os tópicos: a faixa da etapa na trilha, título, abas
 * **Explorar** e **Treinar**, e o painel de desempenho do tópico.
 *
 * Os dois painéis são projetados de uma vez e alternados por visibilidade, em
 * vez de recriados. Assim, voltar da teoria para o treino não zera a rodada
 * que estava em andamento.
 */
@Component({
  selector: 'app-topico-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PainelEtapa, PainelProgresso],
  templateUrl: './topico-layout.html',
  styleUrl: './topico-layout.scss',
})
export class TopicoLayout {
  readonly titulo = input.required<string>();
  readonly descricao = input.required<string>();
  /** Id do tópico no currículo, usado pelo painel de progresso. */
  readonly topicoId = input.required<string>();

  protected readonly abas = ABAS;
  protected readonly aba = signal<AbaTopico>('explorar');

  private readonly botoes = viewChildren<ElementRef<HTMLButtonElement>>('botaoAba');

  protected readonly rotulos: Readonly<Record<AbaTopico, string>> = {
    explorar: 'Explorar',
    treinar: 'Treinar',
  };

  protected selecionar(aba: AbaTopico): void {
    this.aba.set(aba);
  }

  /** Setas navegam entre as abas, como manda o padrão de `tablist`. */
  protected aoTeclar(evento: KeyboardEvent): void {
    const direcao = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0;
    if (direcao === 0) {
      return;
    }

    evento.preventDefault();
    const atual = ABAS.indexOf(this.aba());
    const proximo = (atual + direcao + ABAS.length) % ABAS.length;

    this.aba.set(ABAS[proximo]!);
    this.botoes()[proximo]?.nativeElement.focus();
  }
}
