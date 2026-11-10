import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { cientificoTexto, lorentzComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { Vista3d } from '@shared/components/vista-3d/vista-3d';
import { Traco3d } from '@shared/components/vista-3d/vista-3d.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/eletromagnetismo/magnetismo-e-inducao/magnetismo-e-inducao.i18n.json';
import { geradorMagnetismo } from '@features/eletromagnetismo/magnetismo-e-inducao/magnetismo-e-inducao.gerador';
import { TEORIA_MAGNETISMO } from '@features/eletromagnetismo/magnetismo-e-inducao/magnetismo-e-inducao.teoria';

/** Comprimento com que v e B são desenhados. */
const TAMANHO = 3;

@Component({
  selector: 'app-magnetismo-e-inducao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, PassoAPasso, TopicoLayout, Vista3d],
  templateUrl: './magnetismo-e-inducao.html',
  styleUrl: './magnetismo-e-inducao.scss',
})
export class MagnetismoEInducao {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorMagnetismo;
  protected readonly conceitos = TEORIA_MAGNETISMO.map((teoria) => teoria.id);

  protected readonly carga = signal(4);
  protected readonly velocidade = signal(2000);
  protected readonly campo = signal(5);
  protected readonly angulo = signal(60);

  /** B em décimos de tesla no controle. */
  private readonly b = computed(() => this.campo() / 10);

  protected readonly resolucao = computed(() =>
    lorentzComPassos(this.carga(), this.velocidade(), this.b(), this.angulo()),
  );

  protected readonly forcaTexto = computed(() => cientificoTexto(this.resolucao().resultado));

  /**
   * v no eixo x, B no plano xy a θ de v. Então v × B aponta em z, com módulo
   * proporcional a sen θ e sentido trocado se a carga é negativa.
   */
  protected readonly tracos = computed<readonly Traco3d[]>(() => {
    const t = (this.angulo() * Math.PI) / 180;
    const sinal = Math.sign(this.carga()) || 1;
    const fz = TAMANHO * Math.sin(t) * sinal;
    const tracos: Traco3d[] = [
      {
        pontos: [
          [0, 0, 0],
          [TAMANHO, 0, 0],
        ],
        cor: 'serie-1',
        seta: true,
        rotulo: 'v',
      },
      {
        pontos: [
          [0, 0, 0],
          [TAMANHO * Math.cos(t), TAMANHO * Math.sin(t), 0],
        ],
        cor: 'serie-2',
        seta: true,
        rotulo: 'B',
      },
    ];
    if (Math.abs(fz) > 1e-6 && this.carga() !== 0) {
      tracos.push({
        pontos: [
          [0, 0, 0],
          [0, 0, fz],
        ],
        cor: 'serie-3',
        seta: true,
        rotulo: 'F',
      });
    }
    return tracos;
  });

  protected readonly leituraForca = computed(() =>
    this.carga() === 0 || this.angulo() % 180 === 0
      ? 'semForca'
      : this.carga() > 0
        ? 'positiva'
        : 'negativa',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_MAGNETISMO);
  }
}
