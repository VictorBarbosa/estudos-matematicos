import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ItemRevisao, RevisaoService } from '@core/revisao/services/revisao.service';
import { CARREGAR_GERADOR } from '@core/treino/registro-geradores/registro-geradores';
import { GeradorExercicio } from '@core/treino/models/treino.model';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { BotaoTeoria } from '@shared/components/botao-teoria/botao-teoria';

/**
 * A fila de revisão do dia.
 *
 * A trilha empurra sempre para a frente: vencida a etapa, ela não pede mais
 * nada daquele assunto. Esta página é o contrapeso — alguns exercícios de
 * matéria antiga por dia, escolhidos pelo `RevisaoService` por conceito
 * frágil e por tempo sem praticar.
 *
 * Os geradores vêm por import dinâmico, um por item da fila: revisar não
 * carrega os 75 tópicos, só aquele que está na vez.
 */
@Component({
  selector: 'app-revisar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, BotaoTeoria, RouterLink],
  templateUrl: './revisar.html',
  styleUrl: './revisar.scss',
})
export class Revisar {
  private readonly revisao = inject(RevisaoService);

  /**
   * A fila desta sessão, congelada na abertura.
   *
   * A fila do serviço é derivada do progresso: responder um exercício muda o
   * tempo sem praticar e os conceitos frágeis, e a ordem se refaria embaixo do
   * aluno — o tópico da vez poderia trocar no meio do exercício. Aqui ela é
   * uma fotografia, e `recarregar()` tira outra quando o aluno pedir.
   */
  protected readonly fila = signal(this.revisao.fila());

  protected readonly indice = signal(0);
  protected readonly gerador = signal<GeradorExercicio<unknown> | null>(null);
  protected readonly carregando = signal(false);

  protected readonly atual = computed<ItemRevisao | null>(() => this.fila()[this.indice()] ?? null);
  protected readonly terminou = computed(
    () => this.fila().length > 0 && this.indice() >= this.fila().length,
  );

  constructor() {
    this.carregarAtual();
  }

  protected avancar(): void {
    this.indice.update((atual) => atual + 1);
    this.carregarAtual();
  }

  /** Monta a fila de novo, já com o que foi respondido agora. */
  protected recarregar(): void {
    this.fila.set(this.revisao.fila());
    this.indice.set(0);
    this.carregarAtual();
  }

  /**
   * Traz o gerador do item da vez.
   *
   * O índice é lido fora de qualquer `computed` de propósito: carregar é um
   * efeito, e disparar um import a partir de uma fórmula reativa esconderia
   * esse efeito num lugar onde ninguém espera por ele.
   */
  private carregarAtual(): void {
    const item = this.fila()[this.indice()];
    this.gerador.set(null);

    if (item === undefined) {
      return;
    }

    const carregador = CARREGAR_GERADOR[item.etapa.topicoId];
    if (carregador === undefined) {
      return;
    }

    this.carregando.set(true);
    void carregador()
      .then((gerador) => {
        // A fila pode ter avançado enquanto o chunk baixava.
        if (this.fila()[this.indice()]?.etapa.topicoId === item.etapa.topicoId) {
          this.gerador.set(gerador);
        }
      })
      .finally(() => this.carregando.set(false));
  }
}
