// autenticacaoServices.ts
import { api } from "./api"; // <-- usa o axios já configurado
import { ClienteDTO } from "./clienteService";
import { PrestadorProfileDTO } from "./prestadorService";

type Login = {
  email: string;
  senha: string;
  tipoUsuario: "CLIENTE" | "PRESTADOR";
};

type CadastroCliente = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cep: string;
  tipoUsuario: "CLIENTE";
};

type CadastroPrestador = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cep: string;
  tipoUsuario: "PRESTADOR";
  descricao: string;
  categoriasIds: number[];
};

const API_PREFIX = "/auth";

export interface LoginResponse<T> {
  token: string;
  usuario: T;
}

export const loginClienteService = async (
  data: Login
): Promise<LoginResponse<ClienteDTO>> => {
  const { data: resp } = await api.post<LoginResponse<ClienteDTO>>(
    `${API_PREFIX}/login/cliente`,
    data
  );
  return resp;
};

export const loginPrestadorService = async (
  data: Login
): Promise<LoginResponse<PrestadorProfileDTO>> => {
  const { data: resp } = await api.post<LoginResponse<PrestadorProfileDTO>>(
    `${API_PREFIX}/login/prestador`,
    data
  );
  return resp;
};

export const cadastroClienteService = async (
  data: CadastroCliente
): Promise<ClienteDTO> => {
  try {
    const { data: resp } = await api.post(`${API_PREFIX}/cadastro/cliente`, data);
    return resp;
  } catch (error: any) {
    console.error("Erro ao cadastrar cliente:", error);
    throw new Error(error?.response?.data || "Erro ao cadastrar cliente");
  }
};

export const cadastroPrestadorService = async (
  data: CadastroPrestador
): Promise<PrestadorProfileDTO> => {
  try {
    const { data: resp } = await api.post(`${API_PREFIX}/cadastro/prestador`, data);
    return resp;
  } catch (error: any) {
    console.error("Erro ao cadastrar prestador:", error);
    throw new Error(error?.response?.data || "Erro ao cadastrar prestador");
  }
};
