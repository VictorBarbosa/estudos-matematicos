import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { TOPICO_DO_CONCEITO } from '@core/teoria/registro-teorias/registro-teorias';
import { TeoriaService } from '@core/teoria/services/teoria.service';
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
   * Conceitos a revisar. Num tópico específico, só os que pertencem a ele.
   *
   * O dono de cada conceito vem do índice gerado, não do prefixo do id. O
   * filtro antigo usava `startsWith(topicoId + '.')`, e os prefixos raramente
   * coincidem com o nome da pasta — `operacoes-fundamentais` registra
   * `operacoes.*` —, então a sugestão de revisão só funcionava em 12 dos 75
   * tópicos. Além disso, o corte nos 8 piores conceitos do site vinha ANTES do
   * filtro: bastava haver oito conceitos frágeis em outros tópicos para o
   * painel ficar vazio aqui.
   */
  protected readonly paraRevisar = computed(() => {
    const id = this.topicoId();
    const frageis = this.progresso.conceitosFrageis();
    const doTopico =
      id === undefined ? frageis : frageis.filter((c) => TOPICO_DO_CONCEITO[c.id] === id);

    return doTopico.slice(0, 3);
  });

  protected tituloConceito(id: string): string {
    return this.teoria.tituloDe(id);
  }
}
