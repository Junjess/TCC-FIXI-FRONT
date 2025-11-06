// services/procuraService.ts
import { api } from "./api";

export type CategoriaDescricaoDTO = {
  nomeCategoria: string;      // nome legível da categoria (ex.: "Eletricista")
  descricao: string | null;   // descrição opcional
};

export type PrestadorDTO = {
  id: number;
  nome: string;
  categorias: CategoriaDescricaoDTO[]; // <- ajustado
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

// Normaliza diferentes formatos vindos do backend para CategoriaDescricaoDTO[]
function normalizeCategorias(raw: any): CategoriaDescricaoDTO[] {
  if (!raw) return [];

  // Caso 1: já venha como [{ nomeCategoria, descricao }]
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && ("nomeCategoria" in raw[0] || "descricao" in raw[0])) {
    return raw.map((c: any) => ({
      nomeCategoria: c.nomeCategoria ?? c.descricao ?? String(c) ?? "",
      descricao: c.descricao ?? null,
    }));
  }

  // Caso 2: venha como [{ id, descricao }]
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && ("id" in raw[0] || "descricao" in raw[0])) {
    return raw.map((c: any) => ({
      nomeCategoria: c.descricao ?? "",
      descricao: c.descricao ?? null,
    }));
  }

  // Caso 3: venha como [{ descricaoCategoria }]
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && ("descricaoCategoria" in raw[0])) {
    return raw.map((c: any) => ({
      nomeCategoria: c.descricaoCategoria ?? "",
      descricao: c.descricaoCategoria ?? null,
    }));
  }

  // Caso 4: venha como string[]
  if (Array.isArray(raw) && (raw.length === 0 || typeof raw[0] === "string")) {
    return raw.map((nome: string) => ({
      nomeCategoria: nome,
      descricao: null,
    }));
  }

  // Fallback: tenta converter para string
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
  foto: p.foto ?? undefined,                // <- aqui
  mediaAvaliacao: p.mediaAvaliacao ?? undefined,
  notaPlataforma: p.notaPlataforma ?? undefined,
  descricao: p.descricao ?? undefined,
}));
}
