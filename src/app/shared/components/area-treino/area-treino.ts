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
  RESPOSTAS_NA_JANELA,
} from '@core/progressao/models/progressao.model';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { SessaoTreino } from '@core/treino/sessao-treino/sessao-treino';
import { GeradorExercicio, NIVEIS, ROTULO_NIVEL } from '@core/treino/models/treino.model';
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
  private readonly progressao = inject(ProgressaoService);
  private readonly campo = viewChild<CampoResposta>('campo');

  protected readonly niveis = NIVEIS;
  protected readonly rotuloNivel = ROTULO_NIVEL;

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
    return untracked(() => new SessaoTreino<unknown>(gerador, this.progresso));
  });

  protected readonly alvo = ACERTOS_NA_JANELA;
  protected readonly janela = RESPOSTAS_NA_JANELA;
  protected readonly alvoExigente = ACERTOS_EXIGENTES;

  /** Como este tópico está em relação ao critério de domínio. */
  protected readonly dominio = computed(() =>
    this.progressao.dominioEm(this.gerador().topicoId),
  );

  /** Quantos acertos faltam na janela recente para vencer a etapa. */
  protected readonly faltamParaVencer = computed(() =>
    this.progressao.faltamPara(this.gerador().topicoId),
  );

  /** Quantos acertos no Médio ou no Difícil ainda faltam. */
  protected readonly faltamExigentes = computed(() =>
    this.progressao.faltamExigentesPara(this.gerador().topicoId),
  );

  /**
   * As exigências de cobertura do tópico, cumpridas ou não.
   *
   * Em Frações são as quatro operações. Mostrar a lista inteira — e não só o
   * que falta — é o que permite ao aluno saber onde está antes de escolher o
   * próximo exercício.
   */
  protected readonly requisitos = computed(() => this.dominio().requisitos);

  protected readonly etapaVencida = computed(() =>
    this.progressao.estaConcluida(this.gerador().topicoId),
  );

  protected readonly proximaEtapa = computed(() =>
    this.progressao.proximaDe(this.gerador().topicoId),
  );

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
