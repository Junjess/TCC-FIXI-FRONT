import { api } from "./api";
import { AvaliacaoDTO } from "./prestadorService";

export type AvaliacaoRequest = {
  agendamentoId: number;
  nota: number;
  descricao: string;
};

export async function salvarAvaliacao(payload: AvaliacaoRequest) {
  await api.post("/avaliacoes", payload);
}

export async function listarAvaliacoesPrestador(idPrestador: number): Promise<AvaliacaoDTO[]> {
  const { data } = await api.get(`/prestadores/${idPrestador}/avaliacoes`);
  return data;
}