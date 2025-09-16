import { api } from "./api";

// Esse tipo deve refletir o que o backend manda no DTO
export type AgendamentoRespostaDTO = {
  idAgendamento: number;
  idPrestador: number;
  nomePrestador: string;
  telefonePrestador: string;
  fotoPrestador: string | null;
  cidadePrestador: string | null;
  estadoPrestador: string | null;
  categorias: { nomeCategoria: string; descricao: string | null }[];

  // Campos do CLIENTE (para a tela HomePrestador)
  idCliente: number;
  nomeCliente: string;
  telefoneCliente: string | null;
  fotoCliente: string | null;
  cidadeCliente: string | null;
  estadoCliente: string | null;

  data: string; // "YYYY-MM-DD"
  periodo: string;
  statusAgendamento: "ACEITO" | "PENDENTE" | "RECUSADO" | "CANCELADO";
  avaliado: boolean;
  nota?: number;
  descricaoAvaliacao?: string;
  canceladoPor?: "CLIENTE" | "PRESTADOR" | null;
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
  servico?: string;
};

// DTO usado no agendamento do prestador (para marcar horários)
export type AgendaPrestadorDTO = {
  idAgendamento: number;
  data: string; // "YYYY-MM-DD"
  periodo: "MATUTINO" | "VESPERTINO";
  statusAgendamento: "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO";
};

//  Enum para período
export type Periodo = "MATUTINO" | "VESPERTINO";

// Solicitar agendamento
export async function solicitarAgendamento(
  clienteId: number,
  prestadorId: number,
  nomeCategoria: string,   // agora é string
  data: string,
  periodo: Periodo
) {
  const { data: response } = await api.post<AgendamentoRespostaDTO>(
    `/prestadores/${prestadorId}/agendamentos`,
    null,
    { params: { clienteId, nomeCategoria, data, periodo } } // 🔹 enviando nomeCategoria
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
  return data;
}

export async function cancelarAgendamentoCliente(
  idAgendamento: number,
  clienteId: number
) {
  await api.put(
    `/clientes/${clienteId}/agendamentos/${idAgendamento}/cancelar`
  );
}

export async function cancelarAgendamentoPrestador(
  idAgendamento: number,
  prestadorId: number
) {
  await api.put(
    `/prestadores/${prestadorId}/agendamentos/${idAgendamento}/cancelar`
  );
}


// 🔹 lista solicitações pendentes do prestador
export async function listarSolicitacoesPrestador(prestadorId: number): Promise<AgendamentoSolicitacaoDTO[]> {
  const { data } = await api.get<AgendamentoSolicitacaoDTO[]>(
    `/prestadores/${prestadorId}/agendamentos/pendentes`
  );
  return data;
}


export async function aceitarAgendamentoPrestador(prestadorId: number, agendamentoId: number) {
  const { data } = await api.put(`/prestadores/${prestadorId}/agendamentos/${agendamentoId}/aceitar`);
  return data;
}

export async function recusarAgendamentoPrestador(prestadorId: number, agendamentoId: number) {
  const { data } = await api.put(`/prestadores/${prestadorId}/agendamentos/${agendamentoId}/recusar`);
  return data;
}