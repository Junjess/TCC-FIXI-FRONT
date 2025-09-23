import { api } from "./api";

export interface MensagemDTO {
  id?: number;
  autor: "CLIENTE" | "IA";
  texto: string;
  dataEnvio?: string;
}

export interface ConversaDTO {
  id: number;
  titulo: string
  clienteId: number;
  dataInicio: string;
  mensagens?: MensagemDTO[];
}

// Criar conversa
export const criarConversa = async (clienteId: number): Promise<ConversaDTO> => {
  const res = await api.post(`/api/chat/conversa/${clienteId}`);
  return res.data;
};

// Buscar mensagens
export const buscarMensagens = async (
  conversaId: number
): Promise<MensagemDTO[]> => {
  const res = await api.get(`/api/chat/mensagens/${conversaId}`);
  return res.data;
};

// Salvar mensagem → agora retorna cliente + IA
export const salvarMensagem = async (
  conversaId: number,
  mensagem: { autor: "CLIENTE" | "IA"; texto: string }
): Promise<{ mensagem: MensagemDTO; respostaIA?: MensagemDTO; conversaId: number }> => {
  const res = await api.post(`/api/chat/mensagem/${conversaId}`, mensagem);
  return res.data;
};

export const buscarConversas = async (clienteId: number): Promise<ConversaDTO[]> => {
  const res = await api.get(`/api/chat/conversas/${clienteId}`);
  return res.data;
};

export const atualizarTituloConversa = async (
  conversaId: number,
  titulo: string
): Promise<ConversaDTO> => {
  const res = await api.put(`/api/chat/conversa/${conversaId}/titulo`, { titulo });
  return res.data;
};