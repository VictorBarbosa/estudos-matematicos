import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ACERTOS_EXIGENTES,
  ACERTOS_NA_JANELA,
  ACERTOS_SEGUIDOS_FINAIS,
  RESPOSTAS_NA_JANELA,
} from '@core/progressao/models/progressao.model';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { sessaoDoTopico } from '@core/prova/models/prova.model';
import { ProvaService } from '@core/prova/services/prova.service';
import { I18nService } from '@core/i18n/services/i18n.service';

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
  protected readonly i18n = inject(I18nService);

  readonly topicoId = input.required<string>();

  private readonly progressao = inject(ProgressaoService);
  private readonly provas = inject(ProvaService);

  protected readonly alvo = ACERTOS_NA_JANELA;
  protected readonly janela = RESPOSTAS_NA_JANELA;
  protected readonly alvoExigente = ACERTOS_EXIGENTES;
  protected readonly alvoSeguidos = ACERTOS_SEGUIDOS_FINAIS;
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

  /**
   * A prova de fim de sessão, quando é ela que trava a trilha agora.
   *
   * Só aparece com todas as etapas da sessão vencidas — e nesse caso ela, e
   * não o tópico seguinte, é o que vem depois.
   */
  protected readonly prova = computed(() => {
    const sessao = sessaoDoTopico(this.topicoId());
    if (sessao === null || !this.provas.estaDisponivel(sessao.id)) {
      return null;
    }

    return { titulo: this.i18n.tituloDaArea(sessao.id), rota: `/prova/${sessao.id}` };
  });

  /** A próxima etapa já está aberta por conta desta ter sido vencida? */
  protected readonly proximaLiberada = computed(() => {
    const proxima = this.proxima();
    return proxima !== null && this.progressao.estaLiberada(proxima.topicoId);
  });
}
