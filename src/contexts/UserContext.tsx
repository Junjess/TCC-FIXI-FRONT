import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ClienteDTO, buscarFotoCliente } from "../services/clienteService";
import { PrestadorProfileDTO } from "../services/prestadorService";

export type User = ClienteDTO | PrestadorProfileDTO | null;

type UserContextType = {
  user: User;
  setUser: (user: User, token?: string) => void;
  logout: () => void;
  carregarFoto: (id: number) => Promise<void>;
  token: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    const storedToken = localStorage.getItem("token");

    if (storedUser) setUserState(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
  }, []);

  const setUser = (user: User, token?: string) => {
    setUserState(user);

    if (user) {
      localStorage.setItem("usuario", JSON.stringify(user));
    } else {
      localStorage.removeItem("usuario");
    }

    if (token) {
      setToken(token);
      localStorage.setItem("token", token);
    }
  };

  const logout = () => {
    setUserState(null);
    setToken(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  const carregarFoto = async (id: number) => {
    try {
      const foto = await buscarFotoCliente(id);
      if (foto) {
        setUserState((prev) => (prev ? { ...prev, foto } : prev));
        localStorage.setItem("usuario", JSON.stringify({ ...user, foto }));
      }
    } catch (err) {
      console.error("Erro ao carregar foto no contexto", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, carregarFoto, token }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
};
