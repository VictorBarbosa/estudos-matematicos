import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ACERTOS_NA_JANELA, RESPOSTAS_NA_JANELA } from '@core/progressao/models/progressao.model';
import { ProgressaoService } from '@core/progressao/services/progressao.service';

/**
 * O placar da trilha, na página inicial.
 *
 * Mostra onde o estudo parou e leva de volta para lá em um clique — a pergunta
 * "por onde eu continuo?" é a que mais atrapalha quem estuda sozinho.
 */
@Component({
  selector: 'app-painel-trilha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './painel-trilha.html',
  styleUrl: './painel-trilha.scss',
})
export class PainelTrilha {
  private readonly progressao = inject(ProgressaoService);

  protected readonly alvo = ACERTOS_NA_JANELA;
  protected readonly janela = RESPOSTAS_NA_JANELA;
  protected readonly total = this.progressao.totalDeEtapas;
  protected readonly vencidas = this.progressao.etapasVencidas;
  protected readonly percentual = this.progressao.percentual;
  protected readonly atual = this.progressao.etapaAtual;
  protected readonly completa = this.progressao.trilhaCompleta;
  protected readonly modoLivre = this.progressao.modoLivre;

  /** Quantos acertos a janela recente já acumulou na etapa da vez. */
  protected readonly avancoNaAtual = computed(() => {
    const atual = this.atual();
    return atual === null ? 0 : this.progressao.avancoNa(atual.topicoId);
  });

  /**
   * O reinício pede confirmação no próprio botão, em dois toques.
   *
   * Um `confirm()` nativo travaria a página inteira, e um diálogo só para isso
   * seria exagero — o segundo clique já deixa claro que a ação é deliberada.
   */
  protected readonly confirmandoReinicio = signal(false);

  protected alternarModoLivre(evento: Event): void {
    this.progressao.definirModoLivre((evento.target as HTMLInputElement).checked);
  }

  protected pedirReinicio(): void {
    this.confirmandoReinicio.set(true);
  }

  protected cancelarReinicio(): void {
    this.confirmandoReinicio.set(false);
  }

  protected confirmarReinicio(): void {
    this.progressao.reiniciar();
    this.confirmandoReinicio.set(false);
  }
}
