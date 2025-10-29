import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  cancelarAgendamentoCliente,
  listarAgendamentosPorCliente,
  AgendamentoRespostaDTO,
} from "../../services/agendamentoService";
import { useUser } from "../../contexts/UserContext";
import dayjs from "dayjs";
import { salvarAvaliacaoCliente } from "../../services/avaliacaoService";

type Props = {
  clienteId: number;
};

export default function AgendamentosClienteList({ clienteId }: Props) {
  const [itens, setItens] = useState<AgendamentoRespostaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [avaliarOpen, setAvaliarOpen] = useState(false);
  const [avaliarNota, setAvaliarNota] = useState<number | null>(0);
  const [avaliarDescricao, setAvaliarDescricao] = useState("");
  const [avaliarAgendamentoId, setAvaliarAgendamentoId] = useState<number | null>(null);
  const [cancelando, setCancelando] = useState<Set<number>>(new Set());
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { user } = useUser();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErro(null);

    listarAgendamentosPorCliente(clienteId)
      .then((res) => {
        if (isMounted) {
          const hoje = dayjs().startOf("day");

          const filtrados = res.filter((a) => {
            const dataAg = dayjs(a.data).startOf("day");
            const hoje = dayjs().startOf("day");

            const naoCancelado = a.statusAgendamento !== "CANCELADO";
            const naoRecusado = a.statusAgendamento !== "NEGADO";
            const aindaValido = dataAg.isSame(hoje) || dataAg.isAfter(hoje);

            return naoCancelado && naoRecusado && aindaValido;
          });

          setItens(filtrados);
        }
      })
      .catch((e) => {
        console.error("Erro ao carregar agendamentos:", e);
        if (isMounted)
          setErro(e?.response?.data?.message ?? e.message ?? "Falha ao carregar agendamentos.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [clienteId]);

  async function handleCancelar(idAgendamento: number) {
    if (!user) return;
    try {
      setCancelando((prev) => new Set(prev).add(idAgendamento));

      const resp = await cancelarAgendamentoCliente(idAgendamento, user.id);
      setItens((prev) => prev.filter((a) => a.idAgendamento !== idAgendamento));

      setSnackbar({
        open: true,
        message: resp?.message || "Agendamento cancelado e e-mail enviado!",
        severity: "success",
      });
    } catch (e) {
      console.error("Erro ao cancelar agendamento:", e);
      setSnackbar({
        open: true,
        message: "Erro ao cancelar agendamento.",
        severity: "error",
      });
    } finally {
      setCancelando((prev) => {
        const next = new Set(prev);
        next.delete(idAgendamento);
        return next;
      });
    }
  }

  async function salvar() {
    if (!avaliarAgendamentoId) return;
    try {
      await salvarAvaliacaoCliente({
        agendamentoId: avaliarAgendamentoId,
        nota: avaliarNota ?? 0,
        descricao: avaliarDescricao,
      });

      setItens((prev) => prev.filter((a) => a.idAgendamento !== avaliarAgendamentoId));
      setAvaliarOpen(false);
    } catch (e) {
      console.error("Erro ao salvar avaliação:", e);
      alert("Erro ao salvar avaliação.");
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
        <Typography>Nenhum agendamento encontrado.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={2} sx={{ p: 2 }}>
        {itens.map((ag, idx) => {
          const dataAg = dayjs(ag.data);
          const hoje = dayjs().startOf("day");
          const dataFutura = !dataAg.isBefore(hoje);
          const dataPassada = dataAg.isBefore(hoje);

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
                    src={ag.fotoPrestador ? `data:image/jpeg;base64,${ag.fotoPrestador}` : undefined}
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
                          key={ag.idAgendamento}
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
                  </Box>

                  <Box minWidth={200} textAlign="right">
                    <Typography variant="subtitle2" color="text.secondary">
                      Data
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {dataAg.format("DD/MM/YYYY")}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {ag.periodo}
                    </Typography>

                    {ag.statusAgendamento === "PENDENTE" && (
                      <>
                        <Chip label="PENDENTE" color="warning" size="small" sx={{ mt: 1 }} />
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => handleCancelar(ag.idAgendamento)}
                          disabled={cancelando.has(ag.idAgendamento)}
                        >
                          {cancelando.has(ag.idAgendamento) ? "Cancelando..." : "Cancelar"}
                        </Button>

                      </>
                    )}

                    {ag.statusAgendamento === "ACEITO" && dataFutura && (
                      <>
                        <Chip label="ACEITO" color="success" size="small" sx={{ mt: 1 }} />
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => handleCancelar(ag.idAgendamento)}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

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
    </>
  );
}
