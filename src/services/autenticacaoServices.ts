import axios from "axios";

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
  cep: string; // substitui cidade/estado
  tipoUsuario: "CLIENTE";
};

type CadastroPrestador = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cep: string; // substitui cidade/estado
  tipoUsuario: "PRESTADOR";
  descricao: string;
  categoriasIds: number[]; // 🔹 prestador pode ter várias categorias
};

const API_URL = "http://localhost:8080/auth";

// 🔹 Login Cliente
export const loginClienteService = async (data: Login) => {
  try {
    const response = await axios.post(`${API_URL}/login/cliente`, data);
    return response;
  } catch (error: any) {
    console.error("Erro ao logar cliente:", error);
    throw new Error(error.response?.data || "Erro ao logar cliente");
  }
};

export const loginPrestadorService = async (data: Login) => {
  try {
    const response = await axios.post(`${API_URL}/login/prestador`, data);
    return response;
  } catch (error: any) {
    console.error("Erro ao logar prestador:", error);
    throw new Error(error.response?.data || "Erro ao logar prestador");
  }
};

// 🔹 Cadastro Cliente
export const cadastroClienteService = async (data: CadastroCliente) => {
  try {
    const response = await axios.post(`${API_URL}/cadastro/cliente`, data);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao cadastrar cliente:", error);
    throw new Error(error.response?.data || "Erro ao cadastrar cliente");
  }
};

// 🔹 Cadastro Prestador
export const cadastroPrestadorService = async (data: CadastroPrestador) => {
  try {
    const response = await axios.post(`${API_URL}/cadastro/prestador`, data);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao cadastrar prestador:", error);
    throw new Error(error.response?.data || "Erro ao cadastrar prestador");
  }
};
