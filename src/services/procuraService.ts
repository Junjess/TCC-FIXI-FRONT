import { api } from "./api";

export type CategoriaDescricaoDTO = {
  nomeCategoria: string;     
  descricao: string | null;   
};

export type PrestadorDTO = {
  id: number;
  nome: string;
  categorias: CategoriaDescricaoDTO[];
  cidade: string;
  estado: string;
  telefone: string;
  foto?: string | null;
  mediaAvaliacao?: number | null;
  notaPlataforma?: number | null;
  descricao?: string | null;
};

type ListarPrestadoresParams = {
  busca?: string;
  categorias?: number[];
  cidade?: string;
  estado?: string;
  idCliente: number;
};


function normalizeCategorias(raw: any): CategoriaDescricaoDTO[] {
  if (!raw) return [];

  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && ("nomeCategoria" in raw[0] || "descricao" in raw[0])) {
    return raw.map((c: any) => ({
      nomeCategoria: c.nomeCategoria ?? c.descricao ?? String(c) ?? "",
      descricao: c.descricao ?? null,
    }));
  }

  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && ("id" in raw[0] || "descricao" in raw[0])) {
    return raw.map((c: any) => ({
      nomeCategoria: c.descricao ?? "",
      descricao: c.descricao ?? null,
    }));
  }

  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && ("descricaoCategoria" in raw[0])) {
    return raw.map((c: any) => ({
      nomeCategoria: c.descricaoCategoria ?? "",
      descricao: c.descricaoCategoria ?? null,
    }));
  }

  if (Array.isArray(raw) && (raw.length === 0 || typeof raw[0] === "string")) {
    return raw.map((nome: string) => ({
      nomeCategoria: nome,
      descricao: null,
    }));
  }

  try {
    return Array.from<any>(raw).map((c: any) => ({
      nomeCategoria: typeof c === "string" ? c : (c?.descricao ?? String(c)),
      descricao: c?.descricao ?? null,
    }));
  } catch {
    return [];
  }
}

export async function listarPrestadores({
  busca,
  categorias = [],
  cidade,
  estado,
  idCliente,
}: ListarPrestadoresParams): Promise<PrestadorDTO[]> {
  const params: Record<string, any> = {};
  if (busca && busca.trim()) params.q = busca.trim();
  if (categorias.length) params.categorias = categorias.join(",");
  if (cidade) params.cidade = cidade;
  if (estado) params.estado = estado;

  const { data } = await api.get(`/prestadores/${idCliente}`, { params });

  return (Array.isArray(data) ? data : []).map((p: any) => ({
  id: p.id,
  nome: p.nome,
  categorias: normalizeCategorias(p.categorias),
  cidade: p.cidade,
  estado: p.estado,
  telefone: p.telefone,
  foto: p.foto ?? undefined,                
  mediaAvaliacao: p.mediaAvaliacao ?? undefined,
  notaPlataforma: p.notaPlataforma ?? undefined,
  descricao: p.descricao ?? undefined,
}));
}
