import { REQUISITOS_POR_TOPICO } from '@core/progressao/models/progressao.model';
import {
  ERROS_TOLERADOS,
  MINIMO_DE_QUESTOES,
  SESSOES,
  errosRestantes,
  noLimite,
  planoDaProva,
  reprovou,
  sessaoDoTopico,
  sessaoPorId,
  sessaoSeguinte,
} from '@core/prova/models/prova.model';
import { CURRICULO } from '@curriculo/curriculo';

describe('sessões', () => {
  it('há uma sessão por área do currículo com tópicos prontos', () => {
    const areasComTopicos = CURRICULO.filter((area) =>
      area.topicos.some((topico) => topico.pronto),
    );

    expect(SESSOES.length).toBe(areasComTopicos.length);
    expect(SESSOES.map((sessao) => sessao.id)).toEqual(areasComTopicos.map((area) => area.id));
  });

  it('cada sessão reúne apenas os tópicos prontos da sua área', () => {
    for (const sessao of SESSOES) {
      const area = CURRICULO.find((candidata) => candidata.id === sessao.id)!;
      const prontos = area.topicos.filter((topico) => topico.pronto).map((topico) => topico.id);

      expect(sessao.topicoIds, sessao.id).toEqual(prontos);
    }
  });

  it('todo tópico da trilha pertence a exatamente uma sessão', () => {
    for (const area of CURRICULO) {
      for (const topico of area.topicos.filter((candidato) => candidato.pronto)) {
        expect(sessaoDoTopico(topico.id)?.id, topico.id).toBe(area.id);
      }
    }
  });

  it('sessaoPorId e sessaoSeguinte percorrem a ordem do currículo', () => {
    const primeira = SESSOES[0]!;
    const segunda = SESSOES[1]!;

    expect(sessaoPorId(primeira.id)).toBe(primeira);
    expect(sessaoSeguinte(primeira.id)).toBe(segunda);
    expect(sessaoSeguinte(SESSOES.at(-1)!.id)).toBeNull();
  });

  it('id desconhecido não encontra sessão', () => {
    expect(sessaoPorId('nada')).toBeNull();
    expect(sessaoDoTopico('nada')).toBeNull();
    expect(sessaoSeguinte('nada')).toBeNull();
  });
});

describe('plano da prova', () => {
  it('cobra um item por tipo declarado e um por tópico sem tipos', () => {
    const basica = sessaoPorId('matematica-basica')!;
    const plano = planoDaProva(basica);

    const deFracoes = plano.filter((item) => item.topicoId === 'fracoes');
    const tipos = REQUISITOS_POR_TOPICO['fracoes']!;

    expect(deFracoes.map((item) => item.conceito)).toEqual(
      tipos.map((requisito) => requisito.conceito),
    );

    // Sem tipos declarados, o tópico entra «questões por tópico» vezes (2),
    // uma no Médio e outra no Difícil.
    for (const topicoId of basica.topicoIds.filter((id) => id !== 'fracoes')) {
      const items = plano.filter((item) => item.topicoId === topicoId);
      expect(items.length, topicoId).toBeGreaterThanOrEqual(2);
      expect(items[0]!.conceito, topicoId).toBeUndefined();
      expect(new Set(items.slice(0, 2).map((item) => item.nivel)).size, topicoId).toBe(2);
    }
  });

  it('nenhuma prova fica abaixo do mínimo de questões', () => {
    for (const sessao of SESSOES) {
      expect(planoDaProva(sessao).length, sessao.id).toBeGreaterThanOrEqual(MINIMO_DE_QUESTOES);
    }
  });

  it('a sessão curta é completada repetindo os tópicos em ordem', () => {
    const curta = SESSOES.reduce((menor, sessao) =>
      sessao.topicoIds.length < menor.topicoIds.length ? sessao : menor,
    );
    const plano = planoDaProva(curta);

    expect(plano.length).toBe(MINIMO_DE_QUESTOES);
    // Todo tópico da sessão aparece, e nenhum item vem de fora dela.
    expect(new Set(plano.map((item) => item.topicoId))).toEqual(new Set(curta.topicoIds));
  });

  it('todo item da prova pertence à sessão', () => {
    for (const sessao of SESSOES) {
      for (const item of planoDaProva(sessao)) {
        expect(sessao.topicoIds, sessao.id).toContain(item.topicoId);
      }
    }
  });

  it('os níveis alternam entre Médio e Difícil, sem Fácil', () => {
    const plano = planoDaProva(sessaoPorId('algebra')!);

    expect(plano.map((item) => item.nivel).slice(0, 4)).toEqual([
      'medio',
      'dificil',
      'medio',
      'dificil',
    ]);
    expect(plano.some((item) => item.nivel === 'facil')).toBe(false);
  });

  it('o plano é o mesmo a cada chamada: o que varia é o exercício sorteado', () => {
    const sessao = sessaoPorId('geometria')!;
    expect(planoDaProva(sessao)).toEqual(planoDaProva(sessao));
  });
});

describe('contagem de erros', () => {
  it('tolera dois erros e zera no terceiro', () => {
    expect(ERROS_TOLERADOS).toBe(2);

    expect(reprovou(0)).toBe(false);
    expect(reprovou(1)).toBe(false);
    expect(reprovou(2)).toBe(false);
    expect(reprovou(3)).toBe(true);
  });

  it('o aviso aparece quando o próximo erro zera a sessão', () => {
    expect(noLimite(0)).toBe(false);
    expect(noLimite(1)).toBe(false);
    expect(noLimite(2)).toBe(true);
  });

  it('os erros restantes contam para baixo e param em zero', () => {
    expect(errosRestantes(0)).toBe(2);
    expect(errosRestantes(1)).toBe(1);
    expect(errosRestantes(2)).toBe(0);
    expect(errosRestantes(5)).toBe(0);
  });
});

describe('perguntas inéditas na prova', () => {
  it('cada repetição de um tópico traz uma forma diferente, enquanto houver', async () => {
    const { sortearInedita, formaDaPergunta } = await import('@core/prova/models/prova.model');
    const formas = ['Quanto vale 1?', 'Quanto vale 1 + 2?', 'Qual o dobro de 3?'];
    let i = 0;
    // Um gerador que repete a primeira forma várias vezes antes das outras.
    const sortear = () => ({ enunciado: formas[Math.floor(i++ / 4) % formas.length]! });

    const usadas = new Set<string>();
    const tiradas = [1, 2, 3].map(() => formaDaPergunta(sortearInedita(sortear, usadas).enunciado));

    expect(new Set(tiradas).size).toBe(3);
  });

  it('quando o tópico só tem uma forma, aceita repetir em vez de travar', async () => {
    const { sortearInedita } = await import('@core/prova/models/prova.model');
    const usadas = new Set<string>();
    const sortear = () => ({ enunciado: 'Sempre a mesma 7' });

    expect(sortearInedita(sortear, usadas).enunciado).toBe('Sempre a mesma 7');
    expect(sortearInedita(sortear, usadas).enunciado).toBe('Sempre a mesma 7');
  });

  it('no Pré-cálculo, as questões de um tópico só se repetem quando as formas acabam', async () => {
    const {
      sortearInedita,
      formaDaPergunta,
      sessaoPorId: porId,
    } = await import('@core/prova/models/prova.model');
    const { CARREGAR_GERADOR } = await import('@core/treino/registro-geradores/registro-geradores');
    const { criarRng } = await import('@core/treino/rng/rng');

    const sessao = porId('pre-calculo')!;
    const plano = planoDaProva(sessao);
    const rng = criarRng(9);
    const porTopico = new Map<string, string[]>();
    const usadasPorTopico = new Map<string, Set<string>>();

    for (const item of plano) {
      const gerador = await CARREGAR_GERADOR[item.topicoId]!();
      const usadas = usadasPorTopico.get(item.topicoId) ?? new Set<string>();
      usadasPorTopico.set(item.topicoId, usadas);
      const e = sortearInedita(() => gerador.gerar(item.nivel, rng), usadas);
      porTopico.set(item.topicoId, [
        ...(porTopico.get(item.topicoId) ?? []),
        formaDaPergunta(e.enunciado),
      ]);
    }

    for (const [topicoId, formas] of porTopico) {
      // Quantas formas o tópico tem, de fato, nos níveis que a prova usa.
      const gerador = await CARREGAR_GERADOR[topicoId]!();
      const disponiveis = new Set<string>();
      const amostra = criarRng(1);
      for (let i = 0; i < 300; i++) {
        for (const nivel of ['medio', 'dificil'] as const) {
          disponiveis.add(formaDaPergunta(gerador.gerar(nivel, amostra).enunciado));
        }
      }

      expect(new Set(formas).size).toBe(Math.min(formas.length, disponiveis.size));
    }
  });
});

describe('níveis na prova', () => {
  it('cada tópico que se repete alterna Médio e Difícil', () => {
    for (const sessao of SESSOES) {
      const niveis = new Map<string, string[]>();
      for (const item of planoDaProva(sessao)) {
        niveis.set(item.topicoId, [...(niveis.get(item.topicoId) ?? []), item.nivel]);
      }
      for (const lista of niveis.values()) {
        if (lista.length >= 2) {
          expect(new Set(lista).size).toBe(2);
        }
      }
    }
  });
});
