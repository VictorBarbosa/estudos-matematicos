import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CURRICULO, rotaDoTopico } from '@curriculo/curriculo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { ProvaService } from '@core/prova/services/prova.service';
import { RevisaoService } from '@core/revisao/services/revisao.service';
import { ProgressoService } from '@core/treino/services/progresso.service';

/**
 * Navegação pelo currículo.
 *
 * Mostra todos os tópicos, inclusive os que ainda não foram implementados —
 * o roteiro inteiro fica visível, e o que falta aparece desabilitado em vez
 * de simplesmente não existir.
 *
 * Tópicos adiante da etapa atual aparecem trancados: a trilha é sequencial, e
 * esconder o que vem depois tiraria justamente a noção de caminho.
 */
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  /** Emitido ao navegar, para que o shell feche o menu no celular. */
  readonly navegou = output<void>();

  private readonly progresso = inject(ProgressoService);
  private readonly progressao = inject(ProgressaoService);
  private readonly provas = inject(ProvaService);
  private readonly revisao = inject(RevisaoService);

  protected readonly i18n = inject(I18nService);

  /** Quantos tópicos a fila de revisão de hoje tem, para o atalho aparecer. */
  protected readonly naFilaDeRevisao = computed(() => this.revisao.fila().length);

  protected readonly areas = computed(() =>
    CURRICULO.map((area) => ({
      ...area,
      titulo: this.i18n.tituloDaArea(area.id),
      prontos: area.topicos.filter((topico) => topico.pronto).length,
      // A prova fecha a área: aparece depois dos tópicos, com o seu estado.
      prova: {
        estado: this.provas.estadoDe(area.id),
        rota: `/prova/${area.id}`,
      },
      topicos: area.topicos.map((topico) => {
        const aproveitamento = this.progresso.aproveitamentoDe(topico.id);
        return {
          ...topico,
          titulo: this.i18n.tituloDoTopico(topico.id),
          descricao: this.i18n.descricaoDoTopico(topico.id),
          rota: rotaDoTopico(area.id, topico.id),
          percentual: aproveitamento === null ? null : Math.round(aproveitamento * 100),
          liberado: this.progressao.estaLiberada(topico.id),
          concluido: this.progressao.estaConcluida(topico.id),
        };
      }),
    })),
  );
}
