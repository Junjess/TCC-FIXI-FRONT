import { api } from "./api";

export type AvaliacaoRequest = {
  agendamentoId: number;
  nota: number;
  descricao: string;
};

export async function salvarAvaliacao(payload: AvaliacaoRequest) {
  await api.post("/avaliacoes", payload);
}