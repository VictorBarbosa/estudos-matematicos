import {
  CONFIGURACAO_PADRAO,
  ConfiguracaoSurpresa,
} from '@core/configuracao/models/configuracao.model';
import { montarTrilha } from '@core/progressao/models/progressao.model';
import { criarRng } from '@core/treino/rng/rng';
import { EstatisticaConceito, Tentativa } from '@core/treino/services/progresso.service';
import { Nivel } from '@core/treino/models/treino.model';
import {
  DIA,
  MAXIMO_DE_QUESTOES,
  aprovada,
  estadoSurpresaVazio,
  planoDaSurpresa,
  surpresaDevida,
  tamanhoDaSurpresa,
  toleranciaDaSurpresa,
  topicosElegiveis,
  topicosReprovados,
} from '@core/prova/models/prova-surpresa.model';

const REGRA: ConfiguracaoSurpresa = CONFIGURACAO_PADRAO.surpresa;

/** Um histórico que vence o critério de fábrica num tópico. */
function vencido(): readonly Tentativa[] {
  return Array.from({ length: 10 }, (_, i) => ({
    nivel: (i < 3 ? 'facil' : 'dificil') as Nivel,
    acertou: true,
    desistiu: false,
  }));
}

describe('quando a prova surpresa é devida', () => {
  const agora = 1_000 * DIA;

  it('não aparece com a prova já aberta', () => {
    const devida = surpresaDevida(
      {
        ...estadoSurpresaVazio(),
        ativa: { id: 'x', criadaEm: 0, semente: 1, itens: [], indice: 0, respostas: [] },
      },
      10,
      REGRA,
      agora,
    );

    expect(devida).toBe(false);
  });

  it('não aparece desligada, nem sem tópicos suficientes', () => {
    expect(surpresaDevida(estadoSurpresaVazio(), 10, { ...REGRA, ativa: 0 }, agora)).toBe(false);
    expect(surpresaDevida(estadoSurpresaVazio(), 2, REGRA, agora)).toBe(false);
  });

  it('a primeira aparece assim que há assunto para medir', () => {
    expect(surpresaDevida(estadoSurpresaVazio(), 3, REGRA, agora)).toBe(true);
  });

  it('as seguintes esperam o intervalo, contado do fim da última', () => {
    const feita = { ...estadoSurpresaVazio(), ultimaEm: agora };

    expect(surpresaDevida(feita, 10, REGRA, agora + 1 * DIA)).toBe(false);
    expect(surpresaDevida(feita, 10, REGRA, agora + 6 * DIA)).toBe(false);
    expect(surpresaDevida(feita, 10, REGRA, agora + REGRA.intervaloEmDias * DIA)).toBe(true);
  });

  it('o intervalo configurado manda', () => {
    const feita = { ...estadoSurpresaVazio(), ultimaEm: agora };
    const regra = { ...REGRA, intervaloEmDias: 2 };

    expect(surpresaDevida(feita, 10, regra, agora + 2 * DIA)).toBe(true);
  });
});

describe('o que a prova cobra', () => {
  const trilha = montarTrilha();
  const conceitos: Readonly<Record<string, EstatisticaConceito>> = {};

  it('só os tópicos vencidos entram', () => {
    const historicos = { [trilha[0]!.topicoId]: vencido() };
    const elegiveis = topicosElegiveis(trilha, historicos, conceitos, CONFIGURACAO_PADRAO.etapa);

    expect(elegiveis).toEqual([trilha[0]!.topicoId]);
  });

  it('tópico tirado do plano não entra, mesmo vencido', () => {
    const removidos = new Set([trilha[0]!.topicoId]);
    const historicos = { [trilha[0]!.topicoId]: vencido() };

    const elegiveis = topicosElegiveis(
      montarTrilha(removidos),
      historicos,
      conceitos,
      CONFIGURACAO_PADRAO.etapa,
    );

    expect(elegiveis).toEqual([]);
  });

  it('o plano não repete tópico antes de esgotar os disponíveis', () => {
    const elegiveis = trilha.slice(0, 6).map((etapa) => etapa.topicoId);
    const plano = planoDaSurpresa(elegiveis, { ...REGRA, questoesPorTopico: 1 }, criarRng(7));

    expect(plano).toHaveLength(6);
    expect(new Set(plano.map((item) => item.topicoId)).size).toBe(6);
  });

  it('o nível alterna, e o Fácil nunca entra', () => {
    const elegiveis = trilha.slice(0, 3).map((etapa) => etapa.topicoId);
    const plano = planoDaSurpresa(elegiveis, { ...REGRA, questoesPorTopico: 3 }, criarRng(11));

    expect(plano).toHaveLength(9);
    expect(plano.every((item) => item.nivel !== 'facil')).toBe(true);

    for (const topicoId of elegiveis) {
      const niveis = plano.filter((item) => item.topicoId === topicoId).map((item) => item.nivel);
      expect(niveis).toEqual(['medio', 'dificil', 'extremo']);
    }
  });

  it('a prova não passa do teto de questões', () => {
    const elegiveis = trilha.map((etapa) => etapa.topicoId);
    const plano = planoDaSurpresa(elegiveis, { ...REGRA, questoesPorTopico: 3 }, criarRng(3));

    expect(plano.length).toBe(MAXIMO_DE_QUESTOES);
    expect(tamanhoDaSurpresa(10, { ...REGRA, questoesPorTopico: 1 })).toBe(10);
  });

  it('o sorteio cobre tópicos que não são os primeiros da trilha', () => {
    // Sem embaralhar, a prova cobraria sempre frações e álgebra — nunca o que
    // foi estudado nas últimas semanas, que é justamente o que se esquece.
    const elegiveis = trilha.slice(0, 20).map((etapa) => etapa.topicoId);
    const plano = planoDaSurpresa(elegiveis, { ...REGRA, questoesPorTopico: 1 }, criarRng(99));
    const posicoes = plano.map((item) => elegiveis.indexOf(item.topicoId));

    expect(Math.max(...posicoes)).toBeGreaterThan(10);
  });
});

describe('a régua de aprovação', () => {
  it('75% tolera um erro em quatro questões e cinco em vinte', () => {
    expect(toleranciaDaSurpresa(4, 75)).toBe(1);
    expect(toleranciaDaSurpresa(20, 75)).toBe(5);
    expect(toleranciaDaSurpresa(8, 75)).toBe(2);
  });

  it('aprovar é acertar o total menos os erros tolerados', () => {
    expect(aprovada(3, 4, 75)).toBe(true);
    expect(aprovada(2, 4, 75)).toBe(false);
    expect(aprovada(15, 20, 75)).toBe(true);
    expect(aprovada(14, 20, 75)).toBe(false);
  });

  it('a régua é a mesma da prova de área', () => {
    expect(toleranciaDaSurpresa(8, 75)).toBe(2);
    expect(toleranciaDaSurpresa(34, 75)).toBe(8);
  });

  it('uma prova vazia não aprova ninguém', () => {
    expect(aprovada(0, 0, 75)).toBe(false);
  });
});

describe('os tópicos reprovados', () => {
  const itens = [
    { topicoId: 'a', nivel: 'medio' as const },
    { topicoId: 'b', nivel: 'medio' as const },
    { topicoId: 'a', nivel: 'dificil' as const },
  ];

  it('lista cada tópico errado uma vez, na ordem da prova', () => {
    const reprovados = topicosReprovados(itens, [
      { topicoId: 'a', entrada: '1', acertou: false },
      { topicoId: 'b', entrada: '2', acertou: true },
      { topicoId: 'a', entrada: '3', acertou: false },
    ]);

    expect(reprovados).toEqual(['a']);
  });

  it('acertar todas as questões de um tópico o salva, mesmo com erro em outra', () => {
    const reprovados = topicosReprovados(itens, [
      { topicoId: 'a', entrada: '1', acertou: true },
      { topicoId: 'b', entrada: '2', acertou: false },
      { topicoId: 'a', entrada: '3', acertou: true },
    ]);

    expect(reprovados).toEqual(['b']);
  });

  it('acertar tudo não reprova nada', () => {
    const reprovados = topicosReprovados(
      itens,
      itens.map((item) => ({ topicoId: item.topicoId, entrada: '1', acertou: true })),
    );

    expect(reprovados).toEqual([]);
  });
});
