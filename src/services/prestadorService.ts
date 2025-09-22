import { api } from "./api";

export type PrestadorProfileDTO = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  cep: string;
  foto?: string;
  mediaAvaliacao: number;
  categorias: { id: string; descricao: string }[];
  senha?: string;
};

export type AvaliacaoDTO = {
  nota: number;
  clienteNome: string;
  descricao: string;
};

export type PrestadorDetalhesDTO = {
  id: number;
  nome: string;
  telefone: string;
  foto: string;
  cidade: string;
  estado: string;
  descricao: string;
  categorias: { nomeCategoria: string; descricao: string | null }[];
  mediaAvaliacao: number;
  avaliacoes: AvaliacaoDTO[];
};

// 🔹 Buscar perfil completo de prestador
export async function buscarPrestadorPorId(id: number): Promise<PrestadorDetalhesDTO> {
  const { data } = await api.get<PrestadorDetalhesDTO>(`/prestadores/perfil/${id}`);
  return data;
}

// 🔹 Utilitário: limpar telefone
export function limparTelefone(telefone: string): string {
  if (!telefone) return "";
  return telefone.replace(/\D/g, ""); // remove tudo que não é número
}

// 🔹 Cadastro de prestador
export async function cadastroPrestadorService(prestador: {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  descricao: string;
  categoriaId: number;
}) {
  const payload = {
    ...prestador,
    telefone: limparTelefone(prestador.telefone),
  };

  const { data } = await api.post("/prestadores", payload);
  return data;
}

// 🔹 Atualizar dados do prestador
export async function atualizarPrestador(
  id: number,
  prestador: Partial<Omit<PrestadorProfileDTO, "id">>
): Promise<PrestadorProfileDTO> {
  const { data } = await api.put<PrestadorProfileDTO>(`/prestadores/atualizar/${id}`, prestador);
  return data;
}

// 🔹 Atualizar foto do prestador
export async function atualizarFotoPrestador(
  id: number,
  file: File
): Promise<PrestadorProfileDTO> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<PrestadorProfileDTO>(`/prestadores/${id}/foto`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
