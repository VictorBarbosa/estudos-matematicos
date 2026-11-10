import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Ponto3d, Traco3d } from '@shared/components/vista-3d/vista-3d.model';

const LARGURA = 360;
const ALTURA = 300;
const MARGEM = 28;
/** Inclinação da câmera: quanto se vê "de cima". */
const ELEVACAO = (22 * Math.PI) / 180;

interface Projetado {
  readonly d: string;
  readonly cor: string;
  readonly seta: boolean;
  readonly tracejado: boolean;
  readonly preenchido: boolean;
  readonly rotulo?: { x: number; y: number; texto: string; ancora: 'start' | 'end' };
}

/**
 * Um desenho em perspectiva paralela, girável.
 *
 * Feito para os dois Explorar que explicavam em texto o que é espacial: o
 * produto vetorial (a regra da mão direita só se vê em 3D) e os sólidos de
 * revolução. Não é um motor 3D: projeta polilinhas com z para cima e deixa o
 * aluno girar em torno do eixo vertical — o bastante para a profundidade ler.
 */
@Component({
  selector: 'app-vista-3d',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vista-3d.html',
  styleUrl: './vista-3d.scss',
})
export class Vista3d {
  readonly tracos = input.required<readonly Traco3d[]>();
  readonly descricao = input.required<string>();
  /** Desenha os eixos x, y, z até este alcance; 0 esconde. */
  readonly eixos = input(0);
  readonly rotuloGiro = input('Girar');

  protected readonly LARGURA = LARGURA;
  protected readonly ALTURA = ALTURA;

  /** Ângulo de giro em torno de z, em graus. */
  protected readonly giro = signal(35);

  private projetarCru(p: Ponto3d): [number, number] {
    const t = (this.giro() * Math.PI) / 180;
    const [x, y, z] = p;
    const xr = x * Math.cos(t) - y * Math.sin(t);
    const yr = x * Math.sin(t) + y * Math.cos(t);
    return [xr, z * Math.cos(ELEVACAO) + yr * Math.sin(ELEVACAO)];
  }

  private readonly tracosComEixos = computed<readonly Traco3d[]>(() => {
    const alcance = this.eixos();
    if (alcance <= 0) return this.tracos();
    const eixo = (fim: Ponto3d, rotulo: string): Traco3d => ({
      pontos: [[0, 0, 0], fim],
      cor: 'apoio',
      seta: true,
      rotulo,
    });
    return [
      eixo([alcance, 0, 0], 'x'),
      eixo([0, alcance, 0], 'y'),
      eixo([0, 0, alcance], 'z'),
      ...this.tracos(),
    ];
  });

  protected readonly desenho = computed<readonly Projetado[]>(() => {
    const tracos = this.tracosComEixos();
    const crus = tracos.map((t) => t.pontos.map((p) => this.projetarCru(p)));
    const todos = crus.flat();
    if (todos.length === 0) return [];

    const xs = todos.map(([x]) => x);
    const ys = todos.map(([, y]) => y);
    const [xMin, xMax, yMin, yMax] = [
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...ys),
      Math.max(...ys),
    ];
    const escala = Math.min(
      (LARGURA - 2 * MARGEM) / Math.max(xMax - xMin, 1e-6),
      (ALTURA - 2 * MARGEM) / Math.max(yMax - yMin, 1e-6),
    );
    const cx = (LARGURA - escala * (xMax + xMin)) / 2;
    const cy = (ALTURA + escala * (yMax + yMin)) / 2;
    const tela = ([x, y]: [number, number]): [number, number] => [cx + escala * x, cy - escala * y];

    return tracos.map((traco, i) => {
      const pts = crus[i]!.map(tela);
      const d =
        pts.map(([x, y], j) => `${j === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
        (traco.preenchido ? ' Z' : '');
      const ultimo = pts.at(-1)!;
      const meio: [number, number] = [(pts[0]![0] + ultimo[0]) / 2, (pts[0]![1] + ultimo[1]) / 2];
      const ancoraEm = traco.rotuloNoMeio ? meio : ultimo;
      // Perto da borda direita o texto cresce para a esquerda, para não ser cortado.
      const ancora = ancoraEm[0] > LARGURA - 60 ? 'end' : 'start';
      return {
        d,
        cor: traco.cor ?? 'aresta',
        seta: !!traco.seta,
        tracejado: !!traco.tracejado,
        preenchido: !!traco.preenchido,
        rotulo: traco.rotulo
          ? {
              x: ancoraEm[0] + (ancora === 'end' ? -6 : 6),
              y: ancoraEm[1] - 6,
              texto: traco.rotulo,
              ancora,
            }
          : undefined,
      };
    });
  });

  protected girar(evento: Event): void {
    this.giro.set(Number((evento.target as HTMLInputElement).value));
  }
}
