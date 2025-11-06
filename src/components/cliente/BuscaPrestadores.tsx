// components/cliente/BuscaPrestadores.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Stack, CircularProgress, Typography } from "@mui/material";
import CardPrestador from "./CardPrestador";
import { listarPrestadores, PrestadorDTO } from "../../services/procuraService";
import TrocarTema from "../TrocarTema";

type Props = {
  busca: string;
  categorias?: number[];
  // NOVO: filtros vindos do pai
  aplicarTick: number;            // muda quando o usuário clica "Aplicar"
  uf?: string | null;
  cidades?: string[];             // pode ser vazio ou múltiplas cidades
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

  useEffect(() => {
    const fetchPrestadores = async () => {
      setLoading(true);
      try {
        if (cidades.length > 0) {
          const calls = cidades.map((cidade) =>
            listarPrestadores({ busca, categorias, cidade, estado: uf || undefined })
          );
          const results = await Promise.all(calls);
          // "listarPrestadores" pode devolver array simples; concatenamos tudo
          const merged = uniqueById(results.flat());
          setPrestadores(merged);
        } else {
          const data = await listarPrestadores({
            busca,
            categorias,
            estado: uf || undefined, 
          });
          setPrestadores(data);
        }
      } catch (error) {
        console.error("Erro ao buscar prestadores:", error);
        setPrestadores([]);
      } finally {
        setLoading(false);
      }
    };

    // Executa só quando clicar "Aplicar" no pai (aplicarTick muda)
    fetchPrestadores();
  }, [aplicarTick, busca, uf, JSON.stringify(categorias), JSON.stringify(cidades)]);

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
          foto={p.foto}
          mediaAvaliacao={p.mediaAvaliacao}
          notaPlataforma={p.notaPlataforma}
          descricao={p.descricao}
        />
      ))}
      <TrocarTema />
    </Stack>
  );
}
