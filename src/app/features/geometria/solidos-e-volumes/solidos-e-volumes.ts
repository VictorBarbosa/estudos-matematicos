import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Solido, razaoDeVolumesComPassos, superficieComPassos, volumeComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { Vista3d } from '@shared/components/vista-3d/vista-3d';
import { Traco3d, circunferencia3d } from '@shared/components/vista-3d/vista-3d.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/geometria/solidos-e-volumes/solidos-e-volumes.i18n.json';
import { geradorSolidos } from '@features/geometria/solidos-e-volumes/solidos-e-volumes.gerador';
import { TEORIA_SOLIDOS } from '@features/geometria/solidos-e-volumes/solidos-e-volumes.teoria';

const SOLIDOS: readonly Solido[] = ['cilindro', 'cone', 'esfera'];

@Component({
  selector: 'app-solidos-e-volumes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    PassoAPasso,
    TopicoLayout,
    Vista3d,
  ],
  templateUrl: './solidos-e-volumes.html',
  styleUrl: './solidos-e-volumes.scss',
})
export class SolidosEVolumes {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorSolidos;
  protected readonly conceitos = TEORIA_SOLIDOS.map((teoria) => teoria.id);
  protected readonly solidos = SOLIDOS;

  protected readonly solido = signal<Solido>('cone');
  protected readonly raio = signal(3);
  protected readonly altura = signal(6);
  protected readonly k = signal(2);

  protected readonly dimensoes = computed(() => ({
    raio: this.raio(),
    altura: this.solido() === 'esfera' ? 2 * this.raio() : this.altura(),
    geratriz: Math.hypot(this.raio(), this.altura()),
  }));

  protected readonly analiseVolume = computed(() =>
    volumeComPassos(this.solido(), this.dimensoes()),
  );

  protected readonly analiseSuperficie = computed(() =>
    superficieComPassos(this.solido(), this.dimensoes()),
  );

  protected readonly volume = computed(() => this.analiseVolume().resultado);

  /** O cilindro de referência: mesmo raio, mesma altura. */
  protected readonly volumeCilindro = computed(
    () =>
      volumeComPassos('cilindro', {
        raio: this.raio(),
        altura: this.solido() === 'esfera' ? 2 * this.raio() : this.altura(),
      }).resultado,
  );

  protected readonly fracaoDoCilindro = computed(() => this.volume() / this.volumeCilindro());

  protected readonly volumeTex = computed(() => {
    const r = this.raio();
    const h = this.altura();

    switch (this.solido()) {
      case 'esfera':
        return `V = \\frac{4}{3}\\pi \\cdot ${r}^{3} = ${this.formatar(this.volume())}`;
      case 'cone':
        return `V = \\frac{\\pi \\cdot ${r}^{2} \\cdot ${h}}{3} = ${this.formatar(this.volume())}`;
      default:
        return `V = \\pi \\cdot ${r}^{2} \\cdot ${h} = ${this.formatar(this.volume())}`;
    }
  });

  /** Razão superfície/volume: a grandeza que decide projeto de estruturas. */
  protected readonly razaoSuperficieVolume = computed(
    () => this.analiseSuperficie().resultado / this.volume(),
  );

  protected readonly escala = computed(() => razaoDeVolumesComPassos(this.k()));

  protected readonly volumeAmpliado = computed(() => this.volume() * this.escala().resultado);

  protected readonly superficieAmpliada = computed(
    () => this.analiseSuperficie().resultado * this.k() ** 2,
  );

  protected readonly razaoAmpliada = computed(
    () => this.superficieAmpliada() / this.volumeAmpliado(),
  );

  protected readonly usaAltura = computed(() => this.solido() !== 'esfera');

  /**
   * O sólido em arame, com o raio, a altura e (no cone) a geratriz marcados.
   *
   * O pedido que originou isto: ao ler «raio 7, altura 9» não se via que o
   * raio é o da BASE, nem onde a geratriz entra. No desenho cada medida tem cor
   * e rótulo.
   */
  protected readonly tracos3d = computed<readonly Traco3d[]>(() => {
    const r = this.raio();
    const h = this.altura();
    const lados = [0, 90, 180, 270].map((g) => (g * Math.PI) / 180);
    const raio: Traco3d = {
      pontos: [
        [0, 0, 0],
        [r, 0, 0],
      ],
      cor: 'serie-1',
      rotulo: 'r',
      rotuloNoMeio: true,
    };

    switch (this.solido()) {
      case 'cilindro':
        return [
          { pontos: circunferencia3d(r, 0), cor: 'aresta' },
          { pontos: circunferencia3d(r, h), cor: 'aresta' },
          ...lados.map((t): Traco3d => ({
            pontos: [
              [r * Math.cos(t), r * Math.sin(t), 0],
              [r * Math.cos(t), r * Math.sin(t), h],
            ],
            cor: 'aresta',
          })),
          {
            pontos: [
              [0, 0, 0],
              [0, 0, h],
            ],
            cor: 'serie-2',
            tracejado: true,
            rotulo: 'h',
            rotuloNoMeio: true,
          },
          raio,
        ];
      case 'cone':
        return [
          { pontos: circunferencia3d(r, 0), cor: 'aresta' },
          ...lados.slice(1).map((t): Traco3d => ({
            pontos: [
              [r * Math.cos(t), r * Math.sin(t), 0],
              [0, 0, h],
            ],
            cor: 'aresta',
          })),
          {
            pontos: [
              [r, 0, 0],
              [0, 0, h],
            ],
            cor: 'serie-3',
            rotulo: 'g',
            rotuloNoMeio: true,
          },
          {
            pontos: [
              [0, 0, 0],
              [0, 0, h],
            ],
            cor: 'serie-2',
            tracejado: true,
            rotulo: 'h',
            rotuloNoMeio: true,
          },
          raio,
        ];
      case 'esfera': {
        // Circunferência vertical de raio r, girada `angulo` em torno de z.
        const meridiano = (angulo: number): Traco3d => ({
          pontos: Array.from({ length: 49 }, (_, i) => {
            const t = (2 * Math.PI * i) / 48;
            return [
              r * Math.cos(t) * Math.cos(angulo),
              r * Math.cos(t) * Math.sin(angulo),
              r * Math.sin(t),
            ] as const;
          }),
          cor: 'aresta',
        });
        return [
          { pontos: circunferencia3d(r, 0), cor: 'aresta' },
          meridiano(0),
          meridiano(Math.PI / 2),
          raio,
        ];
      }
      default:
        return [];
    }
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_SOLIDOS);
  }

  protected selecionar(solido: Solido): void {
    this.solido.set(solido);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  protected percentual(valor: number): string {
    return `${(valor * 100).toFixed(1).replace('.', ',')}%`;
  }
}
