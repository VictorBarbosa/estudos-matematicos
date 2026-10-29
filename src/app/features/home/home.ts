import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevisaoService } from '@core/revisao/revisao.service';
import { CURRICULO, totalDeTopicos, totalDeTopicosProntos } from '@curriculo/curriculo';
import { GLOSSARIO } from '@curriculo/glossario';
import { CartaoTopico } from '@shared/components/cartao-topico/cartao-topico';
import { PainelProgresso } from '@shared/components/painel-progresso/painel-progresso';
import { PainelTrilha } from '@shared/components/painel-trilha/painel-trilha';

/** Página inicial: o roteiro inteiro de estudo e o progresso acumulado. */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CartaoTopico, PainelProgresso, PainelTrilha, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly revisao = inject(RevisaoService);

  /** A fila de revisão de hoje, para o convite aparecer só quando há o que revisar. */
  protected readonly revisaoDeHoje = this.revisao.fila;

  protected readonly areas = CURRICULO;
  protected readonly total = totalDeTopicos();
  protected readonly prontos = totalDeTopicosProntos();

  /**
   * Vocabulário da área em francês e inglês.
   *
   * A graduação será numa das duas línguas, e os planos de curso dos cégeps
   * também: saber a matemática sem saber o nome dela na língua da prova é um
   * problema prático.
   */
  protected glossarioDe(areaId: string) {
    return GLOSSARIO[areaId] ?? [];
  }
}
