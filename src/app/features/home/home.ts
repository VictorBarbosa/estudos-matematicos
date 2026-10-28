import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CURRICULO, totalDeTopicos, totalDeTopicosProntos } from '@curriculo/curriculo';
import { CartaoTopico } from '@shared/components/cartao-topico/cartao-topico';
import { PainelProgresso } from '@shared/components/painel-progresso/painel-progresso';
import { PainelTrilha } from '@shared/components/painel-trilha/painel-trilha';

/** Página inicial: o roteiro inteiro de estudo e o progresso acumulado. */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CartaoTopico, PainelProgresso, PainelTrilha],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly areas = CURRICULO;
  protected readonly total = totalDeTopicos();
  protected readonly prontos = totalDeTopicosProntos();
}
