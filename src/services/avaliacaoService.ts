import { api } from "./api";
import { AvaliacaoDTO } from "./prestadorService";

export type AvaliacaoRequest = {
  agendamentoId: number;
  nota: number;
  descricao: string;
};

//cliente avalia o prestador
export async function salvarAvaliacaoCliente(data: AvaliacaoRequest) {
  const resp = await api.post("/avaliacoes/cliente-para-prestador", data);
  return resp.data;
}

//prestador avalia o cliente
export async function salvarAvaliacaoPrestador(data: AvaliacaoRequest) {
  const resp = await api.post("/avaliacoes/prestador-para-cliente", data);
  return resp.data;
}

export async function listarAvaliacoesPrestador(idPrestador: number): Promise<AvaliacaoDTO[]> {
  const { data } = await api.get(`/prestadores/${idPrestador}/avaliacoes`);
  return data;
}

export const buscarAvaliacoesPlataforma = async (prestadorId: number) => {
  try {
    const { data } = await api.get(`/avaliacoes/plataforma/${prestadorId}`);
    return data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ?? "Erro ao buscar avaliações da plataforma";
    throw new Error(msg);
  }
};

export const buscarDesempenhoGeral = async (prestadorId: number) => {
  try {
    const { data } = await api.get(
      `/avaliacoes/plataforma/${prestadorId}/desempenho`
    );
    return data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ?? "Erro ao buscar desempenho geral";
    throw new Error(msg);
  }
};