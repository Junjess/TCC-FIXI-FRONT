import { AgendamentoRespostaDTO } from "../components/AgendamentosClienteList";
import { api } from "./api";

export type Periodo = "MATUTINO" | "VESPERTINO";

export async function listarAgendamentosPorCliente(clienteId: number) {
  const { data } = await api.get<AgendamentoRespostaDTO[]>(
    `/clientes/${clienteId}/agendamentos`
  );
  console.log(data);
  return data;
}

export async function cancelarAgendamento(idAgendamento: number, clienteId: number) {
  await api.delete(`/clientes/${clienteId}/agendamentos/${idAgendamento}/cancelar`);
}

export type AgendaPrestadorDTO = {
  idAgendamento: number;
  data: string; // "YYYY-MM-DD"
  periodo: Periodo;
  statusAgendamento: "PENDENTE" | "ACEITO" | "RECUSADO";
};

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

export async function solicitarAgendamento(
  prestadorId: number,
  clienteId: number,
  dataISO: string,
  periodo: Periodo
): Promise<AgendaPrestadorDTO> {
  const { data } = await api.post<AgendaPrestadorDTO>(
    `/prestadores/${prestadorId}/agendamentos`,
    null,
    { params: { clienteId, data: dataISO, periodo } }
  );
  return data;
}
