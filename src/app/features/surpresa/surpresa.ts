import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { CARREGAR_GERADOR } from '@core/treino/registro-geradores/registro-geradores';
import {
  Exercicio,
  GeradorExercicio,
  Validacao,
  corrigir,
  diagnosticoEm,
  enunciadoEm,
  formatoRespostaEm,
} from '@core/treino/models/treino.model';
import { Rng, criarRng } from '@core/treino/rng/rng';
import {
  ItemSurpresa,
  ResultadoSurpresa,
  toleranciaDaSurpresa,
} from '@core/prova/models/prova-surpresa.model';
import { ProvaSurpresaService } from '@core/prova/services/prova-surpresa.service';
import { sortearInedita } from '@core/prova/models/prova.model';
import { CampoResposta } from '@shared/components/campo-resposta/campo-resposta';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import textos from '@features/surpresa/surpresa.i18n.json';

/** Uma questão já sorteada. */
interface Questao {
  readonly item: ItemSurpresa;
  readonly gerador: GeradorExercicio<unknown>;
  readonly exercicio: Exercicio<unknown>;
}

type Fase = 'carregando' | 'sem-prova' | 'respondendo' | 'terminada';

/**
 * A prova surpresa.
 *
 * Duas coisas fazem esta tela ser diferente da prova de área.
 *
 * **Ela aparece quando quer.** Não há convite nem contagem regressiva: quem
 * abre o site encontra a prova aberta, e o único caminho adiante é responder.
 * O `ProvaSurpresaService` decide quando; aqui só se obedece.
 *
 * **Ela sobrevive ao refresh.** O serviço guarda o plano, a semente e a
 * questão atual; esta página refaz os exercícios com a mesma semente, e o
 * aluno volta exatamente à pergunta em que estava. As respostas já dadas
 * ficaram guardadas no serviço, e o veredito do resultado é recalculado a
 * partir delas.
 */
@Component({
  selector: 'app-surpresa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CampoResposta, Formula, PassoAPasso, RouterLink],
  templateUrl: './surpresa.html',
  styleUrl: './surpresa.scss',
})
export class Surpresa {
  private readonly servico = inject(ProvaSurpresaService);
  private readonly configuracao = inject(ConfiguracaoService);
  private readonly campo = viewChild<CampoResposta>('campo');

  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);

  protected readonly fase = signal<Fase>('carregando');
  protected readonly questoes = signal<readonly Questao[]>([]);
  protected readonly indice = signal(0);
  protected readonly resposta = signal('');
  protected readonly validacao = signal<Validacao | null>(null);
  protected readonly resultado = signal<ResultadoSurpresa | null>(null);

  /** O que a tela de «sem prova» mostra: quanto ela cobraria hoje. */
  protected readonly elegiveis = this.servico.quantosElegiveis;
  protected readonly previstas = this.servico.tamanhoPrevisto;
  protected readonly ultimoResultado = this.servico.ultimoResultado;
  protected readonly ativa = this.servico.ativa;

  protected readonly total = computed(() => this.questoes().length);

  protected readonly regra = this.configuracao.surpresa;

  protected readonly tolerados = computed(() =>
    toleranciaDaSurpresa(this.total(), this.regra().percentualDeAcerto),
  );

  protected readonly questao = computed<Questao | null>(
    () => this.questoes()[this.indice()] ?? null,
  );

  protected readonly numero = computed(() => Math.min(this.indice() + 1, this.total()));
  protected readonly ultima = computed(() => this.numero() === this.total());

  protected readonly corrigida = computed(() => {
    const veredito = this.validacao()?.veredito;
    return veredito === 'correto' || veredito === 'incorreto';
  });

  protected readonly enunciado = computed(() => {
    const questao = this.questao();
    return questao === null ? '' : enunciadoEm(questao.exercicio, this.i18n.idioma());
  });

  protected readonly diagnostico = computed(() => {
    const validacao = this.validacao();
    return validacao === null ? undefined : diagnosticoEm(validacao, this.i18n.idioma());
  });

  protected readonly ajudaDoFormato = computed(() => {
    const questao = this.questao();
    return questao === null ? '' : formatoRespostaEm(questao.gerador, this.i18n.idioma());
  });

  protected readonly gabarito = computed(() => {
    const questao = this.questao();
    return questao === null ? '' : questao.gerador.formatar(questao.exercicio.gabarito);
  });

  protected readonly estadoCampo = computed<'neutro' | 'correto' | 'incorreto'>(() => {
    const veredito = this.validacao()?.veredito;
    if (veredito === 'correto') {
      return 'correto';
    }
    return veredito === 'incorreto' ? 'incorreto' : 'neutro';
  });

  constructor() {
    void this.montar();
  }

  protected responder(): void {
    const questao = this.questao();
    if (questao === null || this.corrigida()) {
      return;
    }

    const validacao = corrigir(questao.gerador, questao.exercicio, this.resposta());
    this.validacao.set(validacao);

    // Formato ilegível não é erro de matemática: pede de novo.
    if (validacao.veredito === 'invalido') {
      return;
    }

    // Grava na hora: recarregar a página não devolve a questão já respondida.
    this.servico.registrarResposta(
      questao.item.topicoId,
      this.resposta(),
      validacao.veredito === 'correto',
    );
  }

  protected proxima(): void {
    if (!this.corrigida()) {
      return;
    }

    if (this.ultima()) {
      this.terminar();
      return;
    }

    this.indice.update((atual) => atual + 1);
    this.resposta.set('');
    this.validacao.set(null);
    this.campo()?.focar();
  }

  /**
   * Refaz os exercícios da prova a partir da semente guardada.
   *
   * A regeneração é o que faz o refresh devolver a MESMA prova: o plano diz
   * quais tópicos e em que nível, a semente diz quais exercícios, e os
   * geradores são determinísticos por contrato. Persistir os exercícios
   * prontos não funcionaria — o gabarito de alguns tópicos é uma instância de
   * classe, que o JSON transforma num objeto sem os métodos de comparação.
   */
  private async montar(): Promise<void> {
    const ativa = this.servico.ativa();

    if (ativa === null) {
      this.fase.set('sem-prova');
      return;
    }

    const geradores = new Map<string, GeradorExercicio<unknown>>();
    for (const topicoId of new Set(ativa.itens.map((item) => item.topicoId))) {
      const carregar = CARREGAR_GERADOR[topicoId];
      if (carregar !== undefined) {
        geradores.set(topicoId, await carregar());
      }
    }

    const rng = criarRng(ativa.semente);
    const formasPorTopico = new Map<string, Set<string>>();
    const questoes = ativa.itens.flatMap((item) => sortear(item, geradores, rng, formasPorTopico));

    this.questoes.set(questoes);
    this.indice.set(Math.min(ativa.indice, Math.max(0, questoes.length - 1)));

    // A prova já foi respondida até o fim e a página foi recarregada antes do
    // resultado: encerra agora, em vez de mostrar uma questão que não existe.
    if (questoes.length === 0 || ativa.indice >= ativa.itens.length) {
      this.terminar();
      return;
    }

    this.fase.set('respondendo');
  }

  private terminar(): void {
    this.resultado.set(this.servico.concluir());
    this.fase.set('terminada');
  }
}

/** Sorteia o exercício de um item, com a mesma forma da prova de área. */
function sortear(
  item: ItemSurpresa,
  geradores: ReadonlyMap<string, GeradorExercicio<unknown>>,
  rng: Rng,
  formasPorTopico: Map<string, Set<string>>,
): readonly Questao[] {
  const gerador = geradores.get(item.topicoId);
  if (gerador === undefined) {
    return [];
  }

  const usadas = formasPorTopico.get(item.topicoId) ?? new Set<string>();
  formasPorTopico.set(item.topicoId, usadas);

  const exercicio = sortearInedita(() => gerador.gerar(item.nivel, rng), usadas);
  return [{ item, gerador, exercicio }];
}
