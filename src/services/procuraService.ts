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

type ListarPrestadoresParams = {
  idCliente: number;
  busca?: string;
  categorias?: number[];
  cidade?: string;
  estado?: string;
};

export async function listarPrestadores({
  idCliente,
  busca,
  categorias,
  cidade,
  estado,
}: ListarPrestadoresParams): Promise<PrestadorDTO[]> {
  const params: any = {};

  if (busca && busca.trim()) params.q = busca.trim();
  if (categorias && categorias.length > 0)
    params.categorias = categorias.join(",");
  if (cidade) params.cidade = cidade;
  if (estado) params.estado = estado;

  const { data } = await api.get(`/prestadores/${idCliente}`, { params });
  console.log("RAW /prestadores:", data);

  return (data ?? []).map((p: any) => ({
    id: p.id,
    nome: p.nome,
    telefone: p.telefone,
    foto: p.foto,
    cidade: p.cidade,
    estado: p.estado,
    descricao: p.descricao,
    categorias: Array.isArray(p.categorias)
      ? p.categorias.map((c: any) => ({
          nomeCategoria: c.nomeCategoria,
          descricao: c.descricao ?? null,
        }))
      : [], 
    mediaAvaliacao: typeof p.mediaAvaliacao === "number" ? p.mediaAvaliacao : 0,
    notaPlataforma: typeof p.notaPlataforma === "number" ? p.notaPlataforma : 0,
  }));
}
