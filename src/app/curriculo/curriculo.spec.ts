import { Routes } from '@angular/router';
import { routes } from '../app-routes/app.routes';
import { CURRICULO, rotaDoTopico, totalDeTopicos, totalDeTopicosProntos } from '@curriculo/curriculo';
import { GLOSSARIO } from '@curriculo/glossario';

/**
 * O currículo é a fonte única da trilha, da navegação e da página inicial.
 *
 * Um descuido aqui não quebra a compilação: ele produz um tópico marcado como
 * pronto que abre em 404, ou uma área sem rota. Estes testes fecham essa porta.
 */
describe('currículo', () => {
  it('não há ids repetidos de área nem de tópico', () => {
    const areas = CURRICULO.map((area) => area.id);
    expect(new Set(areas).size).toBe(areas.length);

    const topicos = CURRICULO.flatMap((area) => area.topicos.map((topico) => topico.id));
    expect(new Set(topicos).size).toBe(topicos.length);
  });

  it('toda área tem rota declarada em app.routes', () => {
    const caminhos = new Set(
      routes.map((rota) => rota.path).filter((caminho): caminho is string => caminho !== undefined),
    );

    for (const area of CURRICULO) {
      expect(caminhos.has(area.id), `a área ${area.id} não tem rota`).toBe(true);
    }
  });

  it('a ordem das rotas espelha a ordem do currículo', () => {
    // A trilha libera um tópico por vez na ordem do currículo; a navegação
    // precisa contar a mesma história.
    const daRota = routes
      .map((rota) => rota.path)
      .filter((caminho) => CURRICULO.some((area) => area.id === caminho));

    expect(daRota).toEqual(CURRICULO.map((area) => area.id));
  });

  it('toda área traz leitura externa e vocabulário em francês e inglês', () => {
    for (const area of CURRICULO) {
      expect(area.referencias?.length ?? 0, `${area.id} sem leitura externa`).toBeGreaterThan(0);
      expect((GLOSSARIO[area.id] ?? []).length, `${area.id} sem glossário`).toBeGreaterThan(5);
    }
  });

  it('as referências externas apontam para endereços https', () => {
    for (const area of CURRICULO) {
      for (const referencia of area.referencias ?? []) {
        expect(referencia.url.startsWith('https://'), referencia.url).toBe(true);
        expect(referencia.nota.length).toBeGreaterThan(20);
      }
    }
  });

  it('o glossário não repete termos dentro de uma área', () => {
    for (const [area, termos] of Object.entries(GLOSSARIO)) {
      const chaves = termos.map((termo) => termo.pt);
      expect(new Set(chaves).size, `${area} repete um termo`).toBe(chaves.length);

      for (const termo of termos) {
        expect(termo.fr.length, `${area}/${termo.pt} sem francês`).toBeGreaterThan(1);
        expect(termo.en.length, `${area}/${termo.pt} sem inglês`).toBeGreaterThan(1);
      }
    }
  });

  it('o glossário só cobre áreas que existem', () => {
    const areas = new Set(CURRICULO.map((area) => area.id));

    for (const area of Object.keys(GLOSSARIO)) {
      expect(areas.has(area), `${area} não é uma área do currículo`).toBe(true);
    }
  });

  it('todo tópico pronto tem rota na sua área', async () => {
    // Carrega os módulos de rota de todas as áreas: lento na primeira vez.
    // Mover um tópico de área sem mover a rota produz um cartão que abre em
    // 404 — foi o risco ao levar Progressões da Álgebra para Funções.
    for (const area of CURRICULO) {
      const prontos = area.topicos.filter((topico) => topico.pronto);
      if (prontos.length === 0) {
        continue;
      }

      const rotaDaArea = routes.find((rota) => rota.path === area.id);
      expect(rotaDaArea?.loadChildren, `${area.id} sem loadChildren`).toBeDefined();

      const carregadas = await (rotaDaArea!.loadChildren as () => Promise<Routes>)();
      const caminhos = new Set((carregadas as Routes).map((rota) => rota.path));

      for (const topico of prontos) {
        expect(caminhos.has(topico.id), `${area.id}/${topico.id} está pronto mas não tem rota`)
          .toBe(true);
      }
    }
  }, 30_000);

  it('nenhuma rota aponta para tópico que não está pronto', async () => {
    for (const area of CURRICULO) {
      const rotaDaArea = routes.find((rota) => rota.path === area.id);
      if (rotaDaArea?.loadChildren === undefined) {
        continue;
      }

      const carregadas = (await (rotaDaArea.loadChildren as () => Promise<Routes>)()) as Routes;
      const prontos = new Set(
        area.topicos.filter((topico) => topico.pronto).map((topico) => topico.id),
      );

      for (const rota of carregadas) {
        // A rota vazia só redireciona para o primeiro tópico da área.
        if (rota.path === '' || rota.redirectTo !== undefined) {
          continue;
        }

        expect(prontos.has(rota.path ?? ''), `${area.id}/${rota.path} tem rota mas não está pronto`)
          .toBe(true);
      }
    }
  }, 30_000);

  it('a rota de um tópico é /área/tópico', () => {
    expect(rotaDoTopico('calculo-1', 'limites')).toBe('/calculo-1/limites');
  });

  it('as contagens batem com a lista', () => {
    expect(totalDeTopicos()).toBe(
      CURRICULO.reduce((total, area) => total + area.topicos.length, 0),
    );
    expect(totalDeTopicosProntos()).toBeLessThanOrEqual(totalDeTopicos());
  });
});
