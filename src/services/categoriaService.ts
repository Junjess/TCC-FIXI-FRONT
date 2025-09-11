import { api } from "./api";

export type CategoriaDTO = { id: number; nome: string; descricao?: string };

let CACHED: CategoriaDTO[] | null = null;
const LS_KEY = "fixi.categorias.v1"; 
export async function listarCategorias(): Promise<CategoriaDTO[]> {

  if (CACHED) return CACHED;

  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    try {
      CACHED = JSON.parse(saved);
      if (Array.isArray(CACHED)) return CACHED;
    } catch {}
  }

  const { data } = await api.get<CategoriaDTO[]>("/categorias");
  const categorias = (data ?? []).map((c: any) => ({
    id: Number(c.id),
    nome: String(c.nome),
    descricao: c.descricao ?? undefined,
  }));

  CACHED = categorias;
  localStorage.setItem(LS_KEY, JSON.stringify(categorias));
  return categorias;
}
