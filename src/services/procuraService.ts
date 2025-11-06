import { api } from "./api";

export type CategoriaDescricaoDTO = {
  nomeCategoria: string;
  descricao: string | null;
};

export type PrestadorDTO = {
  id: number;
  nome: string;
  telefone: string;
  foto: string;
  cidade: string;
  estado: string;
  descricao: string;
  categorias: CategoriaDescricaoDTO[];
  mediaAvaliacao: number;
  notaPlataforma: number; 
};

{/* Dialog de filtros 
type ListarPrestadoresParams = {
  idCliente: number;
  busca?: string;
  categorias?: number[];
  cidade?: string;
  estado?: string;
};*/}

export async function listarPrestadores(params: {
  idCliente?: number;
  busca?: string;
  categorias?: number[];
  cidade?: string;
  estado?: string;
}) {
  const { data } = await api.get<PrestadorDTO[]>("/procura/prestadores", {
    params: {
      idCliente: params.idCliente, 
      busca: params.busca || undefined,
      categorias: params.categorias?.length ? params.categorias.join(",") : undefined,
      cidade: params.cidade || undefined,
      estado: params.estado || undefined,
    },
  });
  return data;
}
