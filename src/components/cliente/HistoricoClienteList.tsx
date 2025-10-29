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
import { salvarAvaliacaoCliente } from "../../services/avaliacaoService";

type Props = {
  clienteId: number;
};

export default function HistoricoClienteList({ clienteId }: Props) {
  const [itens, setItens] = useState<AgendamentoRespostaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Diálogo de avaliação (cliente -> prestador)
  const [avaliarOpen, setAvaliarOpen] = useState(false);
  const [avaliarNota, setAvaliarNota] = useState<number | null>(0);
  const [avaliarDescricao, setAvaliarDescricao] = useState("");
  const [avaliarAgendamentoId, setAvaliarAgendamentoId] = useState<number | null>(null);

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
    let alive = true;
    setLoading(true);
    setErro(null);

    listarAgendamentosPorCliente(clienteId)
      .then((res) => {
        if (!alive) return;
        // histórico: apenas passados e aceitos
        const hoje = dayjs().startOf("day");
        const historico = res.filter(
          (a) =>
            a.statusAgendamento === "ACEITO" &&
            dayjs(a.data).startOf("day").isBefore(hoje)
        );
        setItens(historico);
      })
      .catch((e) => {
        if (!alive) return;
        setErro(e?.response?.data?.message ?? "Falha ao carregar histórico.");
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [clienteId]);

  function abrirAvaliar(idAgendamento: number) {
    setAvaliarAgendamentoId(idAgendamento);
    setAvaliarNota(0);
    setAvaliarDescricao("");
    setAvaliarOpen(true);
  }

  async function salvar() {
    if (!avaliarAgendamentoId) return;
    try {
      await salvarAvaliacaoCliente({
        agendamentoId: avaliarAgendamentoId,
        nota: avaliarNota ?? 0,
        descricao: avaliarDescricao,
      });

      // Atualiza localmente: marca que o CLIENTE já avaliou
      setItens((prev) =>
        prev.map((a) =>
          a.idAgendamento === avaliarAgendamentoId
            ? {
              ...a,
              avaliacaoClienteFeita: true,
              // Não preenche notas aqui: o back só envia após paridade
            }
            : a
        )
      );

      setAvaliarOpen(false);
      setSnackbar({
        open: true,
        message: "Avaliação enviada! Ela ficará visível quando o prestador também avaliar.",
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
        {itens.map((ag, idx) => {
          const dataAg = dayjs(ag.data);
          const paridade =
            ag.notaAvaliacaoPrestador != null &&
            ag.comentarioAvaliacaoPrestador != null &&
            ag.notaAvaliacaoCliente != null &&
            ag.comentarioAvaliacaoCliente != null;

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

                    <Box mt={2}>
                      {paridade ? (
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={3}
                          alignItems="flex-start"
                          useFlexGap
                          flexWrap="wrap"
                        >
                          <Box sx={{ flex: 1, minWidth: 260 }}>
                            <Typography variant="subtitle2">Sua avaliação do prestador</Typography>
                            <Rating value={ag.notaAvaliacaoPrestador ?? 0} readOnly precision={0.5} />
                            <Typography variant="body2" color="text.secondary">
                              {ag.comentarioAvaliacaoPrestador}
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 260 }}>
                            <Typography variant="subtitle2">Avaliação do prestador sobre você</Typography>
                            <Rating value={ag.notaAvaliacaoCliente ?? 0} readOnly precision={0.5} />
                            <Typography variant="body2" color="text.secondary">
                              {ag.comentarioAvaliacaoCliente}
                            </Typography>
                          </Box>
                        </Stack>
                      ) : (
                        // Antes da paridade: mensagens + ação
                        <Stack spacing={1}>
                          {ag.avaliacaoPrestadorFeita && !ag.avaliacaoClienteFeita && (
                            <Typography variant="body2" color="text.secondary">
                              O prestador já fez uma avaliação para você. Avalie para poder ver as duas.
                            </Typography>
                          )}

                          {!ag.avaliacaoPrestadorFeita && ag.avaliacaoClienteFeita && (
                            <Typography variant="body2" color="text.secondary">
                              O prestador ainda não realizou a avaliação. Assim que ele avaliar, ambas ficarão visíveis.
                            </Typography>
                          )}

                          {!ag.avaliacaoPrestadorFeita && !ag.avaliacaoClienteFeita && (
                            <Typography variant="body2" color="text.secondary">
                              Nenhuma avaliação registrada ainda.
                            </Typography>
                          )}

                          {/* botão aparece apenas se o CLIENTE ainda não avaliou */}
                          {!ag.avaliacaoClienteFeita && (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              sx={{ mt: 1 }}
                              onClick={() => abrirAvaliar(ag.idAgendamento)}
                            >
                              Avaliar Serviço
                            </Button>
                          )}
                        </Stack>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Modal de avaliação */}
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
          <Button onClick={salvar} variant="contained" disabled={!avaliarNota}>
            Salvar Avaliação
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
