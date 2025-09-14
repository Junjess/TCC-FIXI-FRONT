import React, { createContext, useContext, useState, ReactNode } from "react";
import { ClienteDTO, buscarFotoCliente } from "../services/clienteService";

type User = ClienteDTO | null;

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
  carregarFoto: (id: number) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  const logout = () => {
    setUser(null);
  };

  /**
   * Atualiza a foto no contexto buscando do back
   */
  const carregarFoto = async (id: number) => {
    try {
      const foto = await buscarFotoCliente(id);
      if (foto) {
        setUser((prev) => (prev ? { ...prev, foto } : prev));
      }
    } catch (err) {
      console.error("Erro ao carregar foto no contexto", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, carregarFoto }}>
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
