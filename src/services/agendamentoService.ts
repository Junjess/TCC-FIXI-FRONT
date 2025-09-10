import { AgendamentoRespostaDTO } from "../components/AgendamentosClienteList";
import {api} from "./api";


export async function listarAgendamentosPorCliente(clienteId: number) {
    const { data } = await api.get<AgendamentoRespostaDTO[]>(
        `/cliente/${clienteId}/agendamentos`
    );
    return data;
}

export async function cancelarAgendamento(idAgendamento: number, clienteId:number) {
  await api.delete(`/clientes/${clienteId}/agendamentos/${idAgendamento}/cancelar`);
}