import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { buscarAvaliacoesPlataforma } from "../../services/avaliacaoService";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, CircularProgress, Typography, Paper } from "@mui/material";

interface AvaliacaoPlataforma {
  tempoPlataforma: number;
  taxaAceitacao: number;
  taxaCancelamento: number;
  avaliacaoIa: number;
  notaFinal: number;
  periodoReferencia: string;
}

function GraficoEvolucaoNotas() {
  const { user } = useUser();
  const [dados, setDados] = useState<AvaliacaoPlataforma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    buscarAvaliacoesPlataforma(user.id)
      .then((res) => setDados(res))
      .catch((err) => console.error("Erro ao carregar gráfico:", err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dados.length) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Nenhuma avaliação da plataforma encontrada.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Evolução das Notas da Plataforma
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodoReferencia" />
          <YAxis domain={[0, 5]} tickCount={6} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="tempoPlataforma"
            stroke="#8884d8"
            name="Tempo na Plataforma"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="taxaAceitacao"
            stroke="#82ca9d"
            name="Taxa de Aceitação"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="taxaCancelamento"
            stroke="#ff7300"
            name="Taxa de Cancelamento"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="avaliacaoIa"
            stroke="#00bcd4"
            name="Avaliação IA"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="notaFinal"
            stroke="#000"
            strokeWidth={3}
            name="Nota Final"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default GraficoEvolucaoNotas;

