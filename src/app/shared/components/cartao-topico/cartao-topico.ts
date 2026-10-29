import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TopicoCurriculo, rotaDoTopico } from '@curriculo/curriculo';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { ProgressoService } from '@core/treino/services/progresso.service';

/** Cartão de um tópico na página inicial. */
@Component({
  selector: 'app-cartao-topico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './cartao-topico.html',
  styleUrl: './cartao-topico.scss',
})
export class CartaoTopico {
  readonly areaId = input.required<string>();
  readonly topico = input.required<TopicoCurriculo>();

  private readonly progresso = inject(ProgressoService);
  private readonly progressao = inject(ProgressaoService);

  protected readonly rota = computed(() => rotaDoTopico(this.areaId(), this.topico().id));

  protected readonly percentual = computed(() => {
    const aproveitamento = this.progresso.aproveitamentoDe(this.topico().id);
    return aproveitamento === null ? null : Math.round(aproveitamento * 100);
  });

  protected readonly etapa = computed(() => this.progressao.etapaDe(this.topico().id));
  protected readonly liberado = computed(() => this.progressao.estaLiberada(this.topico().id));
  protected readonly concluido = computed(() => this.progressao.estaConcluida(this.topico().id));

  /** É a etapa da vez — a única aberta que ainda não foi vencida. */
  protected readonly eAtual = computed(
    () => this.progressao.etapaAtual()?.topicoId === this.topico().id,
  );
}
