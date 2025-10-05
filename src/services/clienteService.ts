import { api } from "./api";

export type ClienteDTO = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  foto?: string;
  fotoTipo?: string | null;
  senha?: string; 
  cep: string;        
};

export async function atualizarCliente(
  id: number,
  cliente: Partial<Omit<ClienteDTO, "id">> 
): Promise<ClienteDTO> {
  const { data } = await api.put<ClienteDTO>(`/clientes/${id}`, cliente);
  return data;
}


export async function atualizarFotoCliente(
  id: number,
  file: File
): Promise<ClienteDTO> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.put<ClienteDTO>(`/clientes/${id}/foto`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function buscarFotoCliente(id: number): Promise<string | null> {
  try {
    const { data } = await api.get<{ base64: string; fotoTipo: string } | null>(
      `/clientes/${id}/foto`
    );

    if (!data) return null;
    return `data:${data.fotoTipo};base64,${data.base64}`;
  } catch (err) {
    console.error("Erro ao buscar foto do cliente", err);
    return null;
  }
}

export async function cadastroClienteService(cliente: {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}) {
  const payload = {
    ...cliente,
    telefone: limparTelefone(cliente.telefone), 
  };

  const { data } = await api.post("/clientes", payload);
  return data;
}

export function limparTelefone(telefone: string): string {
  if (!telefone) return "";
  return telefone.replace(/\D/g, "");
}