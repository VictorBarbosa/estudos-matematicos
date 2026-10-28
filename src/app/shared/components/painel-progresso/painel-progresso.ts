import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ProgressoService } from '@core/treino/progresso.service';
import { TeoriaService } from '@core/teoria/teoria.service';
import { BotaoTeoria } from '@shared/components/botao-teoria/botao-teoria';

/** Quantos pontos de domínio a barra exibe. */
const PONTOS = 5;

/**
 * Acompanhamento de desempenho.
 *
 * Com `topicoId`, mostra o desempenho naquele tópico; sem ele, o panorama
 * geral. Em ambos os casos lista os conceitos com mais erros, levando direto
 * à teoria correspondente — é o que fecha o ciclo aprender, treinar, revisar.
 */
@Component({
  selector: 'app-painel-progresso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BotaoTeoria],
  templateUrl: './painel-progresso.html',
  styleUrl: './painel-progresso.scss',
})
export class PainelProgresso {
  /** Quando omitido, o painel resume todos os tópicos. */
  readonly topicoId = input<string>();

  private readonly progresso = inject(ProgressoService);
  private readonly teoria = inject(TeoriaService);

  protected readonly estatistica = computed(() => {
    const id = this.topicoId();
    if (id === undefined) {
      return null;
    }
    return this.progresso.estatisticaDe(id);
  });

  protected readonly respondidos = computed(() => {
    const estatistica = this.estatistica();
    return estatistica === null
      ? this.progresso.totalRespondido()
      : estatistica.acertos + estatistica.erros;
  });

  protected readonly acertos = computed(() => {
    const estatistica = this.estatistica();
    return estatistica === null ? this.progresso.totalAcertos() : estatistica.acertos;
  });

  protected readonly aproveitamento = computed(() => {
    const total = this.respondidos();
    return total === 0 ? null : this.acertos() / total;
  });

  protected readonly percentual = computed(() => {
    const valor = this.aproveitamento();
    return valor === null ? null : Math.round(valor * 100);
  });

  /** Pontos preenchidos da barra de domínio. */
  protected readonly pontos = computed(() => {
    const valor = this.aproveitamento();
    const cheios = valor === null ? 0 : Math.round(valor * PONTOS);
    return Array.from({ length: PONTOS }, (_, indice) => indice < cheios);
  });

  protected readonly melhorSequencia = computed(() => this.estatistica()?.melhorSequencia ?? null);

  /**
   * Conceitos a revisar. Num tópico específico, só os que pertencem a ele —
   * os ids seguem o formato `topico.conceito`.
   */
  protected readonly paraRevisar = computed(() => {
    const id = this.topicoId();
    const todos = this.progresso.conceitosParaRevisar(8);
    const filtrados = id === undefined ? todos : todos.filter((c) => c.id.startsWith(`${id}.`));
    return filtrados.slice(0, 3);
  });

  protected tituloConceito(id: string): string {
    return this.teoria.tituloDe(id);
  }
}
