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

export const buscarAvaliacoesPlataforma = async (prestadorId: number) => {
  const response = await fetch(`http://localhost:8080/avaliacoes/plataforma/${prestadorId}`);
  if (!response.ok) throw new Error("Erro ao buscar avaliações da plataforma");

  const data = await response.json(); 
  return data;
};

export const buscarDesempenhoGeral = async (prestadorId: number) => {
  const response = await fetch(`http://localhost:8080/avaliacoes/plataforma/${prestadorId}/desempenho`);
  if (!response.ok) throw new Error("Erro ao buscar desempenho geral");
  return response.json();
};