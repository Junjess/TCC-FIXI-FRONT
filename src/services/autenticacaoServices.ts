import axios from "axios";

type Login = {
    email: string;
    senha: string;
    tipoUsuario: string;
}

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
    throw new Error(error.response?.data ||  "Erro ao logar");
  }
};