import { api } from "./api";

export type AgendamentoRespostaDTO = {
  idAgendamento: number;
  idPrestador: number;
  nomePrestador: string;
  telefonePrestador: string;
  fotoPrestador: string | null;
  cidadePrestador: string | null;
  estadoPrestador: string | null;
  categoriaAgendamento: string | null;

  idCliente: number;
  nomeCliente: string;
  telefoneCliente: string | null;
  fotoCliente: string | null;
  fotoTipoCliente?: string | null;
  cidadeCliente: string | null;
  estadoCliente: string | null;

  data: string; // "YYYY-MM-DD"
  periodo: string;
  statusAgendamento: "ACEITO" | "PENDENTE" | "NEGADO" | "CANCELADO";
  avaliado: boolean;
  canceladoPor?: "CLIENTE" | "PRESTADOR" | null;

  avaliacaoClienteFeita?: boolean;  
  avaliacaoPrestadorFeita?: boolean;

  notaAvaliacaoPrestador?: number;
  comentarioAvaliacaoPrestador?: string;
  notaAvaliacaoCliente?: number;
  comentarioAvaliacaoCliente?: string;

  descricaoServico: string;
  valorSugerido?: number | null;
};

export type AgendamentoSolicitacaoDTO = {
  idAgendamento: number;
  idCliente: number;
  nomeCliente: string;
  telefoneCliente: string;
  fotoCliente?: string | null;
  data: string; // "YYYY-MM-DD"
  periodo: string;
  statusAgendamento: "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO";

  //Novos campos
  descricaoServico: string;
  valorSugerido?: number | null;
};

export type AgendaPrestadorDTO = {
  idAgendamento: number;
  data: string; // "YYYY-MM-DD"
  periodo: "MATUTINO" | "VESPERTINO";
  statusAgendamento: "PENDENTE" | "ACEITO" | "NEGADO" | "CANCELADO";
};

export type Periodo = "MATUTINO" | "VESPERTINO";

export async function solicitarAgendamento(
  clienteId: number,
  prestadorId: number,
  idCategoria: number,
  data: string,
  periodo: Periodo,
  descricaoServico: string,
  valorSugerido?: number | null
) {
  const { data: response } = await api.post<AgendamentoRespostaDTO>(
    `/prestadores/${prestadorId}/agendamentos`,
    null,
    {
      params: {
        clienteId,
        idCategoria,
        data,
        periodo,
        descricaoServico,
        valorSugerido,
      },
    }
  );
  return response;
}

export async function listarAgendamentosPorCliente(
  clienteId: number
): Promise<AgendamentoRespostaDTO[]> {
  const { data } = await api.get<AgendamentoRespostaDTO[]>(
    `/clientes/${clienteId}/agendamentos`
  );
  console.log(data);
  return data;
}

export async function listarAgendaPrestador(
  prestadorId: number,
  fromISO: string,
  toISO: string
): Promise<AgendaPrestadorDTO[]> {
  const { data } = await api.get<AgendaPrestadorDTO[]>(
    `/prestadores/${prestadorId}/agenda`,
    { params: { from: fromISO, to: toISO } }
  );
  return data;
}

export async function listarAgendamentosAceitosPorPrestador(
  prestadorId: number
): Promise<AgendamentoRespostaDTO[]> {
  const { data } = await api.get<AgendamentoRespostaDTO[]>(
    `/prestadores/${prestadorId}/agendamentos/aceitos`
  );
  console.log(data);
  return data;
}

export async function cancelarAgendamentoCliente(
  idAgendamento: number,
  clienteId: number
): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>(
    `/clientes/${clienteId}/agendamentos/${idAgendamento}/cancelar`
  );
  return data;
}

export async function cancelarAgendamentoPrestador(
  idAgendamento: number,
  prestadorId: number
) {
  const { data } = await api.put(
    `/prestadores/${prestadorId}/agendamentos/${idAgendamento}/cancelar`
  );
  return data;
}

export async function listarSolicitacoesPrestador(
  prestadorId: number
): Promise<AgendamentoSolicitacaoDTO[]> {
  const { data } = await api.get<AgendamentoSolicitacaoDTO[]>(
    `/prestadores/${prestadorId}/agendamentos/pendentes`
  );
  return data;
}

export async function aceitarAgendamentoPrestador(prestadorId: number, agendamentoId: number) {
  const { data } = await api.put(
    `/prestadores/${prestadorId}/agendamentos/${agendamentoId}/aceitar`
  );
  return data.mensagem;
}

export async function recusarAgendamentoPrestador(
  prestadorId: number,
  agendamentoId: number
) {
  const { data } = await api.put(
    `/prestadores/${prestadorId}/agendamentos/${agendamentoId}/recusar`
  );
  return data;
}

export const contarSolicitacoesPendentes = async (prestadorId: number): Promise<number> => {
  try {
    const response = await api.get(`prestadores/agendamentos/pendentes/${prestadorId}`);
    return response.data.quantidade || 0;
  } catch (error) {
    console.error("Erro ao buscar solicitações pendentes:", error);
    return 0;
  }
};