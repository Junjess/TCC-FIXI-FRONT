import React, { useEffect, useMemo, useState } from "react";
import { Stack, CircularProgress, Typography } from "@mui/material";
import CardPrestador from "./CardPrestador";
import { listarPrestadores, PrestadorDTO } from "../services/procuraService";
import { useUser } from "../contexts/UserContext";
import TrocarTema from "./TrocarTema";

type Props = {
  busca: string;
  categorias?: number[]; 
};

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function BuscaPrestadores({ busca, categorias = [] }: Props) {
  const { user } = useUser();
  const [prestadores, setPrestadores] = useState<PrestadorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedBusca = useDebounce(busca, 400);
  const categoriasKey = useMemo(() => categorias.join(","), [categorias]);

  useEffect(() => {
    const fetchPrestadores = async () => {
      if (!user?.id) {
        setPrestadores([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await listarPrestadores({
          idCliente: user.id,
          busca: debouncedBusca,
          categorias,
        });
        setPrestadores(data);
      } catch (error) {
        console.error("Erro ao buscar prestadores:", error);
        setPrestadores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestadores();
  }, [user?.id, debouncedBusca, categoriasKey]);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ mt: 5 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!prestadores.length) {
    return (
      <Typography align="center" sx={{ mt: 5 }}>
        Nenhum prestador encontrado.
      </Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 3 }}>
      {prestadores.map((p) => (
        <CardPrestador
          key={p.id}
          nome={p.nome}
          categoria={p.categoria}
          cidade={p.cidade}
          estado={p.estado}
          telefone={p.telefone}
          foto={p.foto}
          mediaAvaliacao={p.mediaAvaliacao} 
          descricao={p.descricao}
        />
      ))}
      <TrocarTema/>
    </Stack>
  );
}
