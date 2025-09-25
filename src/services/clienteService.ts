import { api } from "./api";

export type ClienteDTO = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  foto?: string;
  senha?: string; 
  cep: string;        
};

/**
 * Atualiza dados básicos de um cliente (nome, email, telefone, cidade, estado, senha)
 */
export async function atualizarCliente(
  id: number,
  cliente: Partial<Omit<ClienteDTO, "id">> // não permite alterar o id
): Promise<ClienteDTO> {
  const { data } = await api.put<ClienteDTO>(`/clientes/${id}`, cliente);
  return data;
}

/**
 * Atualiza a foto do cliente enviando arquivo multipart
 */
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

/**
 * Busca apenas a foto do cliente em base64
 */
export async function buscarFotoCliente(id: number): Promise<string | null> {
  try {
    const { data } = await api.get<string>(`/clientes/${id}/foto`);
    return data || null; // retorna null caso não tenha foto
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
    telefone: limparTelefone(cliente.telefone), // garante só números
  };

  const { data } = await api.post("/clientes", payload);
  return data;
}

export function limparTelefone(telefone: string): string {
  if (!telefone) return "";
  return telefone.replace(/\D/g, ""); // remove tudo que não é número
}