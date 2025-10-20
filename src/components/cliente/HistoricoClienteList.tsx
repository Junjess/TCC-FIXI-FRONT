import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Rating,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import dayjs from "dayjs";
import {
  AgendamentoRespostaDTO,
  listarAgendamentosPorCliente,
} from "../../services/agendamentoService";
import { salvarAvaliacao } from "../../services/avaliacaoService";

type Props = {
  clienteId: number;
};

export default function HistoricoClienteList({ clienteId }: Props) {
  const [itens, setItens] = useState<AgendamentoRespostaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados do diálogo de avaliação
  const [avaliarOpen, setAvaliarOpen] = useState(false);
  const [avaliarNota, setAvaliarNota] = useState<number | null>(0);
  const [avaliarDescricao, setAvaliarDescricao] = useState("");
  const [avaliarAgendamentoId, setAvaliarAgendamentoId] = useState<number | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErro(null);

    listarAgendamentosPorCliente(clienteId)
      .then((res) => {
        if (isMounted) {
          setItens(res.filter((a) => a.statusAgendamento === "ACEITO"));
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

  // Função para abrir o modal de avaliação
  function abrirAvaliar(idAgendamento: number) {
    setAvaliarAgendamentoId(idAgendamento);
    setAvaliarNota(0);
    setAvaliarDescricao("");
    setAvaliarOpen(true);
  }

  // Salvar avaliação
  async function salvar() {
    if (!avaliarAgendamentoId) return;
    try {
      await salvarAvaliacao({
        agendamentoId: avaliarAgendamentoId,
        nota: avaliarNota ?? 0,
        descricao: avaliarDescricao,
      });

      // Atualiza estado local para marcar o agendamento como avaliado
      setItens((prev) =>
        prev.map((a) =>
          a.idAgendamento === avaliarAgendamentoId
            ? { ...a, avaliado: true, nota: avaliarNota ?? 0, descricaoAvaliacao: avaliarDescricao }
            : a
        )
      );

      setAvaliarOpen(false);
      setSnackbar({
        open: true,
        message: "Avaliação salva com sucesso!",
        severity: "success",
      });
    } catch (e) {
      console.error("Erro ao salvar avaliação:", e);
      setSnackbar({
        open: true,
        message: "Erro ao salvar avaliação.",
        severity: "error",
      });
    }
  }

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
    <>
      <Stack spacing={2} sx={{ p: 2 }}>
        {itens
          .filter((ag) => dayjs(ag.data).isBefore(dayjs().startOf("day")))
          .map((ag, idx) => {
            const dataAg = dayjs(ag.data);
            const dataPassada = true;
            return (
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
                      src={
                        ag.fotoPrestador
                          ? `data:image/jpeg;base64,${ag.fotoPrestador}`
                          : undefined
                      }
                      alt={ag.nomePrestador}
                      sx={{ width: 64, height: 64, fontSize: 24 }}
                    >
                      {ag.nomePrestador?.[0] ?? "?"}
                    </Avatar>

                    <Box flex={1}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography variant="h6" fontWeight="bold">
                          {ag.nomePrestador}
                        </Typography>

                        {ag.categoriaAgendamento && (
                          <Chip
                            size="small"
                            color="primary"
                            label={ag.categoriaAgendamento}
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        {ag.cidadePrestador ?? "-"}
                        {ag.estadoPrestador ? `, ${ag.estadoPrestador}` : ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ag.telefonePrestador ?? "-"}
                      </Typography>

                      <Typography variant="body2" fontWeight="bold" mt={1}>
                        {dataAg.format("DD/MM/YYYY")} - {ag.periodo}
                      </Typography>

                      {/* Exibe avaliação ou botão */}
                      <Box mt={2}>
                        {ag.avaliado ? (
                          <>
                            <Rating value={ag.nota ?? 0} readOnly />
                            <Typography variant="body2" color="text.secondary">
                              {ag.descricaoAvaliacao ?? "Sem comentário"}
                            </Typography>
                          </>
                        ) : (
                          <>
                            {dataPassada && (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                sx={{ mt: 2 }}
                                onClick={() => abrirAvaliar(ag.idAgendamento)}
                              >
                                Avaliar Serviço
                              </Button>
                            )}
                          </>
                        )}
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
      </Stack>

      {/*Modal de avaliação */}
      <Dialog open={avaliarOpen} onClose={() => setAvaliarOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Avaliar Serviço</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Rating
              value={avaliarNota}
              onChange={(_, newValue) => setAvaliarNota(newValue)}
              precision={0.5}
            />
            <TextField
              label="Como foi o atendimento?"
              multiline
              rows={4}
              value={avaliarDescricao}
              onChange={(e) => setAvaliarDescricao(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvaliarOpen(false)}>Fechar</Button>
          <Button onClick={salvar} variant="contained">
            Salvar Avaliação
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
