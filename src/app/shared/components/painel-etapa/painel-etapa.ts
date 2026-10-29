import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ACERTOS_EXIGENTES,
  ACERTOS_NA_JANELA,
  RESPOSTAS_NA_JANELA,
} from '@core/progressao/models/progressao.model';
import { ProgressaoService } from '@core/progressao/services/progressao.service';

/**
 * A faixa de jogo no topo de cada tópico.
 *
 * Diz em que etapa da trilha o estudo está, quanto falta para vencê-la e, uma
 * vez vencida, abre a porta para a seguinte. É o elo visível entre a área de
 * treino e a progressão.
 */
@Component({
  selector: 'app-painel-etapa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './painel-etapa.html',
  styleUrl: './painel-etapa.scss',
})
export class PainelEtapa {
  readonly topicoId = input.required<string>();

  private readonly progressao = inject(ProgressaoService);

  protected readonly alvo = ACERTOS_NA_JANELA;
  protected readonly janela = RESPOSTAS_NA_JANELA;
  protected readonly alvoExigente = ACERTOS_EXIGENTES;
  protected readonly total = this.progressao.totalDeEtapas;
  protected readonly modoLivre = this.progressao.modoLivre;

  protected readonly etapa = computed(() => this.progressao.etapaDe(this.topicoId()));
  protected readonly proxima = computed(() => this.progressao.proximaDe(this.topicoId()));
  protected readonly concluida = computed(() => this.progressao.estaConcluida(this.topicoId()));

  protected readonly dominio = computed(() => this.progressao.dominioEm(this.topicoId()));
  protected readonly avanco = computed(() => this.progressao.avancoNa(this.topicoId()));
  protected readonly faltam = computed(() => this.progressao.faltamPara(this.topicoId()));
  protected readonly faltamExigentes = computed(() =>
    this.progressao.faltamExigentesPara(this.topicoId()),
  );

  /** Exigências de cobertura do tópico — em Frações, as quatro operações. */
  protected readonly requisitos = computed(() => this.dominio().requisitos);

  /** Um marcador por acerto exigido na janela, preenchido conforme ela avança. */
  protected readonly marcadores = computed(() =>
    Array.from({ length: ACERTOS_NA_JANELA }, (_, indice) => indice < this.avanco()),
  );

  /** A próxima etapa já está aberta por conta desta ter sido vencida? */
  protected readonly proximaLiberada = computed(() => {
    const proxima = this.proxima();
    return proxima !== null && this.progressao.estaLiberada(proxima.topicoId);
  });
}
