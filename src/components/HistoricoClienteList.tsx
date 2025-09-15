import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { AgendamentoRespostaDTO } from "../services/agendamentoService"; // 🔹 usa direto do service
import { listarAgendamentosPorCliente } from "../services/agendamentoService";

type Props = {
  clienteId: number;
};

export default function HistoricoClienteList({ clienteId }: Props) {
  const [itens, setItens] = useState<AgendamentoRespostaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErro(null);

    listarAgendamentosPorCliente(clienteId)
      .then((res) => {
        if (isMounted) {
          setItens(
            res.filter(
              (a) => a.avaliado === true && a.statusAgendamento === "ACEITO"
            )
          );
        }
      })
      .catch((e) => {
        if (isMounted)
          setErro(e?.response?.data?.message ?? "Falha ao carregar histórico.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [clienteId]);

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ p: 4 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (erro) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{erro}</Typography>
      </Box>
    );
  }

  if (itens.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Nenhum agendamento concluído ainda.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {itens.map((ag, idx) => (
        <Card
          key={`${ag.idPrestador}-${ag.data}-${idx}`}
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            overflow: "hidden",
            transition: "0.3s",
            "&:hover": { boxShadow: 6 },
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={ag.fotoPrestador ?? undefined}
                alt={ag.nomePrestador}
                sx={{ width: 64, height: 64, fontSize: 24 }}
              >
                {ag.nomePrestador?.[0] ?? "?"}
              </Avatar>

              <Box flex={1}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flexWrap="wrap"
                >
                  <Typography variant="h6" fontWeight="bold">
                    {ag.nomePrestador}
                  </Typography>
                  {ag.categorias?.map((cat, i) => (
                    <Chip
                      key={i}
                      size="small"
                      color="primary"
                      label={cat.nomeCategoria}
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {ag.cidadePrestador ?? "-"}
                  {ag.estadoPrestador ? `, ${ag.estadoPrestador}` : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ag.telefonePrestador ?? "-"}
                </Typography>

                <Typography variant="body2" fontWeight="bold" mt={1}>
                  {dayjs(ag.data).format("DD/MM/YYYY")} - {ag.periodo}
                </Typography>

                {/* 🔹 Exibe avaliação */}
                <Box mt={2}>
                  <Rating value={ag.nota ?? 0} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    {ag.descricaoAvaliacao ?? "Sem comentário"}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
