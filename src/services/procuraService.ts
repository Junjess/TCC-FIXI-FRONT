import { api } from "./api";

export type PrestadorDTO = {
  id: number;
  nome: string;
  telefone: string;
  foto: string;
  cidade: string;
  estado: string;
  descricao: string;
  categoria: string;
  mediaAvaliacao: number;
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
    categoria: p.categoria,
    mediaAvaliacao: typeof p.mediaAvaliacao === "number" ? p.mediaAvaliacao : 0,
  }));
}
