import { api } from "./api";

export type AvaliacaoDTO = {
  nota: number;
  clienteNome: string;
};

export type PrestadorDetalhesDTO = {
  id: number;
  nome: string;
  telefone: string;
  foto: string;
  cidade: string;
  estado: string;
  descricao: string;
  categoria: string;
  mediaAvaliacao: number;
  avaliacoes: AvaliacaoDTO[];
};

export async function buscarPrestadorPorId(id: number): Promise<PrestadorDetalhesDTO> {
  const { data } = await api.get<PrestadorDetalhesDTO>(`/prestadores/perfil/${id}`);
  return data;
}
