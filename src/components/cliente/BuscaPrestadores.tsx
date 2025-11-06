import React, { useEffect, useState } from "react";
import { Stack, CircularProgress, Typography } from "@mui/material";
import CardPrestador from "./CardPrestador";
import { listarPrestadores, PrestadorDTO } from "../../services/procuraService";
import TrocarTema from "../TrocarTema";
import { useUser } from "../../contexts/UserContext"; // <- garante que existe

type Props = {
  busca: string;
  categorias?: number[];
  aplicarTick: number;
  uf?: string | null;
  cidades?: string[];
};

function uniqueById(lista: PrestadorDTO[]): PrestadorDTO[] {
  const map = new Map<number, PrestadorDTO>();
  for (const p of lista) map.set(p.id, p);
  return Array.from(map.values());
}

export default function BuscaPrestadores({
  busca,
  categorias = [],
  aplicarTick,
  uf,
  cidades = [],
}: Props) {
  const [prestadores, setPrestadores] = useState<PrestadorDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const idCliente = user?.id;

  useEffect(() => {
    let alive = true;
    const fetchPrestadores = async () => {
      if (!idCliente) {
        setPrestadores([]);
        return;
      }
      setLoading(true);
      try {
        if (cidades.length > 0) {
          const calls = cidades.map((cidade) =>
            listarPrestadores({
              busca,
              categorias,
              cidade,
              estado: uf || undefined,
              idCliente,
            })
          );
          const results = await Promise.all(calls);
          const merged = uniqueById(results.flat());
          if (alive) setPrestadores(merged);
        } else {
          const data = await listarPrestadores({
            busca,
            categorias,
            estado: uf || undefined,
            idCliente,
          });
          if (alive) setPrestadores(data);
        }
      } catch (error) {
        console.error("Erro ao buscar prestadores:", error);
        if (alive) setPrestadores([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchPrestadores();
    return () => { alive = false; };
  }, [aplicarTick, busca, uf, categorias, cidades, idCliente]);

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
        Não encontramos prestadores para os filtros selecionados.
      </Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 3 }}>
      {prestadores.map((p) => (
        <CardPrestador
          key={p.id}
          id={p.id}
          nome={p.nome}
          categorias={p.categorias}
          cidade={p.cidade}
          estado={p.estado}
          telefone={p.telefone}
          foto={p.foto ?? undefined}
          mediaAvaliacao={p.mediaAvaliacao ?? undefined}
          notaPlataforma={p.notaPlataforma ?? undefined}
          descricao={p.descricao ?? ""}  
        />
      ))}
      <TrocarTema />
    </Stack>
  );
}
