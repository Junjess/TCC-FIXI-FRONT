import axios from "axios";

type Login = {
  email: string;
  senha: string;
  tipoUsuario: string;
};

type CadastroCliente = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cep: string;            // 🔹 substitui cidade/estado
  tipoUsuario: string;
};

type CadastroPrestador = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cep: string;            // 🔹 substitui cidade/estado
  tipoUsuario: string;
  tipoServico: string;
  descricao: string;
};

export const loginClienteService = async (data: Login) => {
  try {
    const response = await axios.post("http://localhost:8080/auth/login/cliente", data);
    return response;
  } catch (error: any) {
    console.error("Erro ao logar:", error);
    throw new Error(error.response?.data || "Erro ao logar");
  }
};

export const loginPrestadorService = async (data: Login) => {
  try {
    const response = await axios.post("http://localhost:8080/auth/login/prestador", data);
    return response;
  } catch (error: any) {
    console.error("Erro ao logar:", error);
    throw new Error(error.response?.data || "Erro ao logar");
  }
};

export const cadastroClienteService = async (data: CadastroCliente) => {
  try {
    const response = await axios.post("http://localhost:8080/auth/cadastro/cliente", data);
    return response;
  } catch (error: any) {
    console.error("Erro ao cadastrar:", error);
    throw new Error(error.response?.data || "Erro ao cadastrar cliente");
  }
};

export const cadastroPrestadorService = async (data: CadastroPrestador) => {
  try {
    const response = await axios.post("http://localhost:8080/auth/cadastro/prestador", data);
    return response;
  } catch (error: any) {
    console.error("Erro ao cadastrar:", error);
    throw new Error(error.response?.data || "Erro ao cadastrar prestador");
  }
};
