import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CURRICULO, rotaDoTopico } from '@curriculo/curriculo';
import { ProgressaoService } from '@core/progressao/progressao.service';
import { ProgressoService } from '@core/treino/progresso.service';

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

  protected readonly areas = computed(() =>
    CURRICULO.map((area) => ({
      ...area,
      prontos: area.topicos.filter((topico) => topico.pronto).length,
      topicos: area.topicos.map((topico) => {
        const aproveitamento = this.progresso.aproveitamentoDe(topico.id);
        return {
          ...topico,
          rota: rotaDoTopico(area.id, topico.id),
          percentual: aproveitamento === null ? null : Math.round(aproveitamento * 100),
          liberado: this.progressao.estaLiberada(topico.id),
          concluido: this.progressao.estaConcluida(topico.id),
        };
      }),
    })),
  );
}
