import { api } from "./api";
import { AvaliacaoDTO } from "./prestadorService";

export type AvaliacaoRequest = {
  agendamentoId: number;
  nota: number;
  descricao: string;
};

export type AvaliacaoPlataformaItem = {
  periodoReferencia: string;             // "YYYY-MM-DD"
  notaFinal: number;
  mediaClientes?: number | null;         
  qtdAvaliacoesClientes?: number | null; 
};

export type AvaliacaoClienteItem = {
  data: string;   // "YYYY-MM-DD"
  nota: number;
};

export type DesempenhoGeralDTO = {
  avaliacoesPlataforma: AvaliacaoPlataformaItem[];
  avaliacoesClientes: AvaliacaoClienteItem[];
};

// cliente avalia o prestador
export async function salvarAvaliacaoCliente(data: AvaliacaoRequest) {
  const resp = await api.post("/avaliacoes/cliente-para-prestador", data);
  return resp.data;
}

// prestador avalia o cliente
export async function salvarAvaliacaoPrestador(data: AvaliacaoRequest) {
  const resp = await api.post("/avaliacoes/prestador-para-cliente", data);
  return resp.data;
}

export async function listarAvaliacoesPrestador(idPrestador: number): Promise<AvaliacaoDTO[]> {
  const { data } = await api.get(`/prestadores/${idPrestador}/avaliacoes`);
  return data;
}

export const buscarAvaliacoesPlataforma = async (prestadorId: number) => {
  const { data } = await api.get(`/avaliacoes/plataforma/${prestadorId}`);
  return data;
};

export const buscarDesempenhoGeral = async (prestadorId: number) => {
  const { data } = await api.get<DesempenhoGeralDTO>(
    `/avaliacoes/plataforma/${prestadorId}/desempenho`
  );
  return data;
};
