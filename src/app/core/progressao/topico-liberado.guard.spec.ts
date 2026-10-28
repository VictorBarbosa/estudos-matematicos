import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { ProgressoService } from '@core/treino/progresso.service';
import { ACERTOS_PARA_LIBERAR, TRILHA } from './progressao.model';
import { ProgressaoService } from './progressao.service';
import { topicoLiberadoGuard } from './topico-liberado.guard';

/** Executa o guard como o router faria, para a rota de um tópico. */
function ativar(topicoId: string): boolean | UrlTree {
  const rota = { routeConfig: { path: topicoId } } as ActivatedRouteSnapshot;
  const estado = {} as RouterStateSnapshot;

  return TestBed.runInInjectionContext(() => topicoLiberadoGuard(rota, estado)) as
    | boolean
    | UrlTree;
}

describe('topicoLiberadoGuard', () => {
  let progresso: ProgressoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    progresso = TestBed.inject(ProgressoService);
  });

  it('deixa entrar na etapa da vez', () => {
    expect(ativar(TRILHA[0]!.topicoId)).toBe(true);
  });

  it('barra um tópico adiante e devolve para a etapa atual', () => {
    const destino = ativar(TRILHA[5]!.topicoId);

    expect(destino).toBeInstanceOf(UrlTree);
    expect(String(destino)).toBe(TRILHA[0]!.rota);
  });

  it('libera o tópico assim que a etapa anterior é vencida', () => {
    for (let sequencia = 1; sequencia <= ACERTOS_PARA_LIBERAR; sequencia++) {
      progresso.registrar({
        topicoId: TRILHA[0]!.topicoId,
        conceitos: [],
        acertou: true,
        sequencia,
      });
    }

    expect(ativar(TRILHA[1]!.topicoId)).toBe(true);
  });

  it('não interfere em rotas que não são tópicos', () => {
    expect(ativar('')).toBe(true);
  });

  it('no modo livre, qualquer tópico abre', () => {
    TestBed.inject(ProgressaoService).definirModoLivre(true);

    expect(ativar(TRILHA.at(-1)!.topicoId)).toBe(true);
  });
});
