import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import {
  ERROS_TOLERADOS,
  ItemDaProva,
  Sessao,
  errosRestantes,
  noLimite,
  planoDaProva,
  reprovou,
  sessaoPorId,
  sessaoSeguinte,
} from '@core/prova/models/prova.model';
import { ProvaService } from '@core/prova/services/prova.service';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { CARREGAR_GERADOR } from '@core/treino/registro-geradores/registro-geradores';
import { Exercicio, GeradorExercicio, Validacao, corrigir } from '@core/treino/models/treino.model';
import { Rng, criarRng, sementeAleatoria } from '@core/treino/rng/rng';
import { CampoResposta } from '@shared/components/campo-resposta/campo-resposta';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/prova/prova.i18n.json';

/** Uma questão já sorteada: o item do plano com o exercício e seu gerador. */
interface Questao {
  readonly item: ItemDaProva;
  readonly gerador: GeradorExercicio<unknown>;
  readonly exercicio: Exercicio<unknown>;
}

type Fase = 'carregando' | 'trancada' | 'vencida' | 'respondendo' | 'aprovado' | 'reprovado';

/**
 * A prova final de uma sessão.
 *
 * Cobra o assunto inteiro da área de uma vez, com {@link ERROS_TOLERADOS} erros
 * de tolerância. Três decisões de projeto merecem registro:
 *
 * **O veredito é gravado na hora.** Aprovação e reprovação vão para o
 * armazenamento no mesmo instante em que acontecem, antes de qualquer tela
 * nova. Sem isso, recarregar a página no momento do terceiro erro escaparia da
 * zeragem — e uma prova de que se foge não mede nada.
 *
 * **Recarregar recomeça a prova.** Não há estado persistido da tentativa em
 * andamento: quem recarrega volta à questão 1, com exercícios novos. Perder o
 * caminho já feito é dissuasão suficiente, e guardar o andamento custaria mais
 * complexidade do que o problema vale.
 *
 * **As respostas da prova não entram no histórico de treino.** O histórico
 * alimenta a janela de domínio de cada etapa; misturar a prova nele faria a
 * avaliação mexer no que ela está avaliando. A prova tem um efeito só —
 * aprovar ou zerar a sessão.
 */
@Component({
  selector: 'app-prova',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CampoResposta, Formula, RouterLink],
  templateUrl: './prova.html',
  styleUrl: './prova.scss',
})
export class Prova {
  private readonly rota = inject(ActivatedRoute);
  private readonly configuracao = inject(ConfiguracaoService);
  private readonly provas = inject(ProvaService);
  private readonly progressao = inject(ProgressaoService);
  private readonly campo = viewChild<CampoResposta>('campo');

  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly errosTolerados = ERROS_TOLERADOS;

  /**
   * A sessão vem da URL e não muda enquanto a página vive.
   *
   * Duas provas nunca ficam pendentes ao mesmo tempo na trilha, então não há
   * caminho em que esta página precise trocar de sessão sem ser recriada.
   */
  private readonly sessaoId = this.rota.snapshot.paramMap.get('sessaoId') ?? '';

  protected readonly sessao: Sessao | null = sessaoPorId(this.sessaoId, this.provas.sessoes());

  protected readonly fase = signal<Fase>('carregando');
  protected readonly questoes = signal<readonly Questao[]>([]);
  protected readonly indice = signal(0);
  protected readonly erros = signal(0);
  protected readonly acertos = signal(0);
  /**
   * A sessão já foi perdida nesta tentativa?
   *
   * Separado da fase de propósito: a zeragem é gravada no instante do terceiro
   * erro, mas a tela do resultado só aparece depois que a pessoa lê o veredito
   * e o gabarito da questão que errou. Perder sem ver no que errou ensinaria
   * nada.
   */
  protected readonly perdida = signal(false);
  protected readonly resposta = signal('');
  protected readonly validacao = signal<Validacao | null>(null);

  protected readonly questao = computed<Questao | null>(
    () => this.questoes()[this.indice()] ?? null,
  );
  protected readonly total = computed(() => this.questoes().length);
  protected readonly numero = computed(() => this.indice() + 1);

  /** Já houve veredito para a questão atual? */
  protected readonly corrigida = computed(() => {
    const veredito = this.validacao()?.veredito;
    return veredito === 'correto' || veredito === 'incorreto';
  });

  protected readonly acertou = computed(() => this.validacao()?.veredito === 'correto');

  /** O próximo erro zera a sessão. */
  protected readonly noLimite = computed(() =>
    noLimite(this.erros(), this.configuracao.prova().errosTolerados),
  );
  protected readonly restantes = computed(() =>
    errosRestantes(this.erros(), this.configuracao.prova().errosTolerados),
  );

  protected readonly ultima = computed(() => this.numero() === this.total());

  /** O que o botão de avançar faz agora. */
  protected readonly rotuloDoAvanco = computed(() => {
    if (this.perdida()) {
      return 'verResultado';
    }

    return this.ultima() ? 'terminar' : 'proxima';
  });

  /** O título da área, para as frases da tela. */
  protected readonly titulo = computed(() =>
    this.sessao === null ? '' : this.i18n.tituloDaArea(this.sessao.id),
  );

  /** Para onde ir depois de passar: a primeira etapa da sessão seguinte. */
  protected readonly proximaSessao = computed(() => {
    const seguinte =
      this.sessao === null ? null : sessaoSeguinte(this.sessao.id, this.provas.sessoes());
    if (seguinte === null) {
      return null;
    }

    const etapa =
      this.progressao.trilha().find((candidata) => candidata.areaId === seguinte.id) ?? null;
    return etapa === null
      ? null
      : { titulo: this.i18n.tituloDaArea(seguinte.id), rota: etapa.rota };
  });

  /** Para onde ir depois de reprovar: o primeiro tópico da sessão zerada. */
  protected readonly recomeco = computed(() => {
    if (this.sessao === null) {
      return null;
    }

    const etapa = this.progressao
      .trilha()
      .find((candidata) => candidata.areaId === this.sessao!.id);
    return etapa?.rota ?? null;
  });

  protected readonly estadoCampo = computed<'neutro' | 'correto' | 'incorreto'>(() => {
    const veredito = this.validacao()?.veredito;
    if (veredito === 'correto') {
      return 'correto';
    }

    return veredito === 'incorreto' || veredito === 'invalido' ? 'incorreto' : 'neutro';
  });

  /** O gabarito da questão errada, para a pessoa aprender na hora. */
  protected readonly gabarito = computed(() => {
    const questao = this.questao();
    return questao === null ? '' : questao.gerador.formatar(questao.exercicio.gabarito);
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

    // Formato ilegível não é erro de matemática: a prova pede de novo.
    if (validacao.veredito === 'invalido') {
      return;
    }

    if (validacao.veredito === 'correto') {
      this.acertos.update((quantos) => quantos + 1);
      return;
    }

    const erros = this.erros() + 1;
    this.erros.set(erros);

    if (reprovou(erros, this.configuracao.prova().errosTolerados)) {
      // Grava na hora: recarregar a página não escapa daqui.
      this.provas.reprovar(this.sessaoId);
      this.perdida.set(true);
    }
  }

  protected proxima(): void {
    if (!this.corrigida() || this.fase() !== 'respondendo') {
      return;
    }

    if (this.perdida()) {
      this.fase.set('reprovado');
      return;
    }

    if (this.ultima()) {
      this.provas.aprovar(this.sessaoId);
      this.fase.set('aprovado');
      return;
    }

    this.indice.update((atual) => atual + 1);
    this.resposta.set('');
    this.validacao.set(null);
    this.campo()?.focar();
  }

  /**
   * Carrega os geradores da sessão e sorteia a prova inteira de uma vez.
   *
   * Sortear tudo no começo é o que permite dizer "questão 3 de 12" desde a
   * primeira tela — e deixa o conjunto fixo durante a tentativa.
   */
  private async montar(): Promise<void> {
    if (this.sessao === null) {
      this.fase.set('trancada');
      return;
    }

    // Prova passada não se refaz: refazer só poderia tirar o que já foi ganho.
    if (this.provas.venceu(this.sessaoId)) {
      this.fase.set('vencida');
      return;
    }

    if (!this.provas.estaDisponivel(this.sessaoId)) {
      this.fase.set('trancada');
      return;
    }

    const plano = planoDaProva(this.sessao, this.configuracao.prova());
    const rng = criarRng(sementeAleatoria());

    const geradores = new Map<string, GeradorExercicio<unknown>>();
    for (const topicoId of this.sessao.topicoIds) {
      const carregar = CARREGAR_GERADOR[topicoId];
      if (carregar !== undefined) {
        geradores.set(topicoId, await carregar());
      }
    }

    this.questoes.set(plano.flatMap((item) => sortear(item, geradores, rng)));
    this.fase.set(this.questoes().length === 0 ? 'trancada' : 'respondendo');
  }
}

/** Sorteia o exercício de um item, ou nada se o tópico não tem gerador. */
function sortear(
  item: ItemDaProva,
  geradores: ReadonlyMap<string, GeradorExercicio<unknown>>,
  rng: Rng,
): readonly Questao[] {
  const gerador = geradores.get(item.topicoId);
  if (gerador === undefined) {
    return [];
  }

  // `pendentes` é como os geradores com cobertura por tipo escolhem o que
  // sortear; quem não tem tipos ignora a lista.
  const pendentes = item.conceito === undefined ? undefined : [item.conceito];

  return [{ item, gerador, exercicio: gerador.gerar(item.nivel, rng, pendentes) }];
}
