import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ACERTOS_EXIGENTES,
  ACERTOS_NA_JANELA,
  ACERTOS_POR_TIPO,
  RESPOSTAS_NA_JANELA,
} from '@core/progressao/models/progressao.model';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { ProvaService } from '@core/prova/services/prova.service';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { SessaoTreino } from '@core/treino/sessao-treino/sessao-treino';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { I18nService } from '@core/i18n/services/i18n.service';
import {
  CHAVE_DO_NIVEL,
  GeradorExercicio,
  dicaEm,
  formatoRespostaEm,
  diagnosticoEm,
  enunciadoEm,
  formasDoGabarito,
} from '@core/treino/models/treino.model';
import { BotaoTeoria } from '@shared/components/botao-teoria/botao-teoria';
import { CampoResposta } from '@shared/components/campo-resposta/campo-resposta';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';

/**
 * Área de treino de um tópico.
 *
 * Toda a mecânica — sortear, corrigir, pontuar, revelar a resolução e registrar
 * o progresso — vive aqui e na `SessaoTreino`. Um tópico novo ganha avaliação
 * apenas implementando seu `GeradorExercicio` e passando-o a este componente.
 */
@Component({
  selector: 'app-area-treino',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BotaoTeoria, CampoResposta, Formula, PassoAPasso, RouterLink],
  templateUrl: './area-treino.html',
  styleUrl: './area-treino.scss',
})
export class AreaTreino {
  readonly gerador = input.required<GeradorExercicio<unknown>>();

  private readonly progresso = inject(ProgressoService);
  private readonly configuracao = inject(ConfiguracaoService);
  private readonly progressao = inject(ProgressaoService);
  private readonly provas = inject(ProvaService);
  private readonly campo = viewChild<CampoResposta>('campo');

  protected readonly chaveDoNivel = CHAVE_DO_NIVEL;
  protected readonly i18n = inject(I18nService);

  /**
   * A rodada em andamento.
   *
   * O `untracked` é essencial: construir a sessão lê signals dela mesma (o
   * nível, para sortear o primeiro exercício), e sem ele esses signals virariam
   * dependências deste `computed`. Trocar o nível então recriaria a sessão
   * inteira — o exercício mudava, mas a seleção voltava para "Fácil" e o placar
   * zerava. Só a troca do gerador deve produzir uma sessão nova.
   */
  protected readonly sessao = computed(() => {
    const gerador = this.gerador();
    return untracked(
      () => new SessaoTreino<unknown>(gerador, this.progresso, this.configuracao.configuracao),
    );
  });

  protected readonly alvo = ACERTOS_NA_JANELA;
  protected readonly janela = RESPOSTAS_NA_JANELA;
  protected readonly alvoExigente = ACERTOS_EXIGENTES;
  protected readonly acertosPorTipo = ACERTOS_POR_TIPO;

  /**
   * O tópico está trancado por uma reprovação na prova surpresa?
   *
   * O aviso existe porque o efeito é brutal e silencioso: o progresso do
   * tópico é apagado, e sem uma frase explicando, o aluno acharia que o site
   * perdeu os dados.
   */
  protected readonly trancado = computed(() =>
    this.progressao.estaTrancado(this.gerador().topicoId),
  );

  /** Como este tópico está em relação ao critério de domínio. */
  protected readonly dominio = computed(() => this.progressao.dominioEm(this.gerador().topicoId));

  /** Quantos acertos faltam na janela recente para vencer a etapa. */
  protected readonly faltamParaVencer = computed(() =>
    this.progressao.faltamPara(this.gerador().topicoId),
  );

  /** Quantos acertos no Médio ou no Difícil ainda faltam. */
  protected readonly faltamExigentes = computed(() =>
    this.progressao.faltamExigentesPara(this.gerador().topicoId),
  );

  /**
   * As quatro condições para a etapa abrir, cumpridas ou não.
   *
   * A tela mostrava duas delas. A que faltava é a que mais confunde: a
   * sequência final de acertos, que um erro zera — sem ela na lista, errar o
   * último exercício fechava a etapa sem explicação nenhuma.
   */
  protected readonly exigencias = computed(() =>
    this.progressao.exigenciasDe(this.gerador().topicoId),
  );

  /**
   * As exigências de cobertura do tópico, cumpridas ou não.
   *
   * Em Frações são as quatro operações. Mostrar a lista inteira — e não só o
   * que falta — é o que permite ao aluno saber onde está antes de escolher o
   * próximo exercício.
   */
  protected readonly requisitos = computed(() => this.dominio().requisitos);

  /**
   * O que ainda falta para a etapa abrir, item a item.
   *
   * As treze condições — as quatro do critério e os nove tipos — já apareciam,
   * mas no fim da página. O placar fica no topo, onde o olho vai a cada
   * resposta, e contava só a rodada: acertos, erros, sequência. Nada ali dizia
   * quanto falta para a próxima fase.
   */
  protected readonly oQueFalta = computed(() => [
    ...this.exigencias()
      .filter((exigencia) => !exigencia.cumprida)
      .map((exigencia) => `${this.i18n.t(exigencia.rotulo)} ${exigencia.feitos}/${exigencia.alvo}`),
    ...this.requisitos()
      .filter((requisito) => !requisito.cumprido)
      .map(
        (requisito) => `${this.i18n.t(requisito.rotulo)} ${requisito.feitos}/${requisito.acertos}`,
      ),
  ]);

  /** Quantas condições faltam. Zero significa etapa vencida. */
  protected readonly quantoFalta = computed(() => this.oQueFalta().length);

  /** A mesma lista em palavras, para o `title` e para o leitor de tela. */
  protected readonly resumoDoQueFalta = computed(() => {
    const itens = this.oQueFalta();
    return itens.length === 0
      ? this.i18n.t('treino.nadaFalta')
      : this.i18n.t('treino.faltaPara', { itens: itens.join(', ') });
  });

  protected readonly etapaVencida = computed(() =>
    this.progressao.estaConcluida(this.gerador().topicoId),
  );

  protected readonly proximaEtapa = computed(() =>
    this.progressao.proximaDe(this.gerador().topicoId),
  );

  /**
   * A prova de fim de sessão, quando é ela que vem antes da próxima etapa.
   *
   * Vencer o último tópico de uma área não abre a área seguinte: abre a prova.
   * Oferecer «Ir para Ângulos e triângulos» ali mandava o aluno a uma porta
   * trancada — e o guard, redirecionando de volta para a mesma rota, travava
   * a página.
   */
  protected readonly provaPendente = computed(() => {
    const proxima = this.proximaEtapa();
    if (proxima !== null && this.progressao.estaLiberada(proxima.topicoId)) {
      return null;
    }

    const sessao = this.provas.pendente();
    return sessao === null
      ? null
      : { titulo: this.i18n.tituloDaArea(sessao.id), rota: `/prova/${sessao.id}` };
  });

  /** A próxima etapa, só quando ela estiver mesmo aberta. */
  protected readonly proximaLiberada = computed(() => {
    const proxima = this.proximaEtapa();
    return proxima !== null && this.progressao.estaLiberada(proxima.topicoId) ? proxima : null;
  });

  /**
   * As escritas corretas do gabarito — em Frações, a mista e a imprópria.
   *
   * O campo sempre aceitou as duas, mas o gabarito mostrava uma só: quem
   * respondeu 28/27 lia, no exercício seguinte, "Resposta correta: 1 1/27".
   */
  protected readonly gabarito = computed(() =>
    formasDoGabarito(this.gerador(), this.sessao().exercicio().gabarito),
  );

  /**
   * O enunciado e a dica na língua da interface.
   *
   * O exercício guarda as três versões e a tela escolhe uma a cada render: é
   * o que faz a troca de idioma no cabeçalho valer também para a pergunta que
   * já está na tela, sem sorteá-la de novo.
   */
  protected readonly enunciado = computed(() =>
    enunciadoEm(this.sessao().exercicio(), this.i18n.idioma()),
  );

  protected readonly dica = computed(() => dicaEm(this.sessao().exercicio(), this.i18n.idioma()));

  /** O texto de apoio do campo de resposta, na língua da interface. */
  protected readonly ajudaDoFormato = computed(() =>
    formatoRespostaEm(this.gerador(), this.i18n.idioma()),
  );

  /** O diagnóstico do erro na língua da interface. */
  protected readonly diagnostico = computed(() => {
    const validacao = this.sessao().validacao();
    return validacao === null ? undefined : diagnosticoEm(validacao, this.i18n.idioma());
  });

  protected readonly estadoCampo = computed<'neutro' | 'correto' | 'incorreto'>(() => {
    const veredito = this.sessao().validacao()?.veredito;
    if (veredito === 'correto') {
      return 'correto';
    }
    return veredito === 'incorreto' ? 'incorreto' : 'neutro';
  });

  /** Enter verifica a resposta ou, se já corrigida, avança. */
  protected aoEnviar(): void {
    const sessao = this.sessao();
    if (sessao.corrigido()) {
      this.proximo();
    } else {
      sessao.responder();
    }
  }

  protected proximo(): void {
    this.sessao().proximo();
    this.campo()?.focar();
  }
}
