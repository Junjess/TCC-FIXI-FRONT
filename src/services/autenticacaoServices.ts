import axios from "axios";
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

const API_URL = "http://localhost:8080/auth";

// 🔹 Login Cliente
export const loginClienteService = async (data: Login): Promise<ClienteDTO> => {
  const response = await axios.post<ClienteDTO>(`${API_URL}/login/cliente`, data);
  return response.data;
};

// 🔹 Login Prestador
export const loginPrestadorService = async (data: Login): Promise<PrestadorProfileDTO> => {
  const response = await axios.post<PrestadorProfileDTO>(`${API_URL}/login/prestador`, data);
  return response.data; 
};

// 🔹 Cadastro Cliente
export const cadastroClienteService = async (data: CadastroCliente): Promise<ClienteDTO> => {
  try {
    const response = await axios.post(`${API_URL}/cadastro/cliente`, data);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao cadastrar cliente:", error);
    throw new Error(error.response?.data || "Erro ao cadastrar cliente");
  }
};

// 🔹 Cadastro Prestador
export const cadastroPrestadorService = async (data: CadastroPrestador): Promise<PrestadorProfileDTO> => {
  try {
    const response = await axios.post(`${API_URL}/cadastro/prestador`, data);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao cadastrar prestador:", error);
    throw new Error(error.response?.data || "Erro ao cadastrar prestador");
  }
};
