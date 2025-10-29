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
  Snackbar,
  Alert,
  Stack,
  Typography,
  Container,
  TextField,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { useUser } from "../contexts/UserContext";
import {
  listarAgendamentosAceitosPorPrestador,
  type AgendamentoRespostaDTO,
} from "../services/agendamentoService";
import { salvarAvaliacaoPrestador } from "../services/avaliacaoService";
import HeaderPrestador from "../components/prestador/HeaderPrestador";
import TrocarTema from "../components/TrocarTema";

export default function HistoricoPrestador() {
  const theme = useTheme();
  const { user } = useUser();

  const [itens, setItens] = useState<AgendamentoRespostaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [avaliarOpen, setAvaliarOpen] = useState(false);
  const [avaliarNota, setAvaliarNota] = useState<number | null>(0);
  const [avaliarDescricao, setAvaliarDescricao] = useState("");
  const [avaliarAgendamentoId, setAvaliarAgendamentoId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      setErro(null);
      try {
        const data = await listarAgendamentosAceitosPorPrestador(user.id);
        const hoje = dayjs().startOf("day");
        const passados = data.filter(
          (ag) =>
            ag.statusAgendamento === "ACEITO" &&
            dayjs(ag.data).startOf("day").isBefore(hoje)
        );
        if (!alive) return;
        setItens(passados);
      } catch (e: any) {
        if (!alive) return;
        setErro(e?.response?.data?.message ?? "Falha ao carregar histórico.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const paridade = (ag: AgendamentoRespostaDTO) =>
    ag.notaAvaliacaoPrestador != null &&
    ag.comentarioAvaliacaoPrestador != null &&
    ag.notaAvaliacaoCliente != null &&
    ag.comentarioAvaliacaoCliente != null;


  function abrirAvaliar(idAgendamento: number) {
    setAvaliarAgendamentoId(idAgendamento);
    setAvaliarNota(0);
    setAvaliarDescricao("");
    setAvaliarOpen(true);
  }

  async function salvar() {
    if (!avaliarAgendamentoId || !avaliarNota) return;
    try {
      setSaving(true);
      await salvarAvaliacaoPrestador({
        agendamentoId: avaliarAgendamentoId,
        nota: avaliarNota,
        descricao: avaliarDescricao,
      });

      setItens((prev) =>
        prev.map((a) =>
          a.idAgendamento === avaliarAgendamentoId
            ? { ...a, avaliacaoPrestadorFeita: true }
            : a
        )
      );

      setAvaliarOpen(false);
      setSnackbar({
        open: true,
        message: "Avaliação enviada! Assim que o cliente avaliar, ambas ficarão visíveis.",
        severity: "success",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Erro ao salvar avaliação.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  function formatarTelefone(telefone?: string | null) {
    if (!telefone) return "-";
    const apenasNumeros = telefone.replace(/\D/g, "");
    if (apenasNumeros.length === 11)
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    if (apenasNumeros.length === 10)
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    return telefone;
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.paper }}>
      {/* Header no mesmo padrão das outras telas */}
      <HeaderPrestador onEditarPerfil={() => {}} />

      <Container sx={{ mt: 5, mb: 4 }}>
        {/* Card “container” igual ao do cliente */}
        <Card
          sx={{
            backgroundColor: theme.palette.background.default,
            boxShadow: 4,
            borderRadius: 3,
            p: 3,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Histórico de Agendamentos (Aceitos e já realizados)
          </Typography>

          {loading ? (
            <Stack alignItems="center" sx={{ p: 4 }}>
              <CircularProgress />
            </Stack>
          ) : erro ? (
            <Typography color="error">{erro}</Typography>
          ) : itens.length === 0 ? (
            <Typography color="text.secondary">Não há agendamentos passados.</Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {itens.map((ag) => (
                <Card
                  key={ag.idAgendamento}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={
                          ag.fotoCliente
                            ? `data:${ag.fotoTipoCliente ?? "image/jpeg"};base64,${ag.fotoCliente}`
                            : undefined
                        }
                        alt={ag.nomeCliente}
                        sx={{ width: 56, height: 56 }}
                      >
                        {ag.nomeCliente?.[0] ?? "?"}
                      </Avatar>

                      <Box flex={1}>
                        <Typography variant="h6" fontWeight="bold">
                          {ag.nomeCliente}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tel: {formatarTelefone(ag.telefoneCliente)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ag.cidadeCliente ?? "-"}
                          {ag.estadoCliente ? `, ${ag.estadoCliente}` : ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Categoria: {ag.categoriaAgendamento ?? "-"}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" mt={1}>
                          {dayjs(ag.data).format("DD/MM/YYYY")} • {ag.periodo}
                        </Typography>

                        <Box mt={2}>
                          {paridade(ag) ? (
                            // mostrar as DUAS avaliações
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={3}
                              alignItems="flex-start"
                              useFlexGap
                              flexWrap="wrap"
                            >
                              <Box sx={{ flex: 1, minWidth: 260 }}>
                                <Typography variant="subtitle2">
                                  Sua avaliação do cliente
                                </Typography>
                                <Rating value={ag.notaAvaliacaoCliente ?? 0} readOnly precision={0.5} />
                                <Typography variant="body2" color="text.secondary">
                                  {ag.comentarioAvaliacaoCliente}
                                </Typography>
                              </Box>

                              <Box sx={{ flex: 1, minWidth: 260 }}>
                                <Typography variant="subtitle2">
                                  Avaliação do cliente sobre você
                                </Typography>
                                <Rating value={ag.notaAvaliacaoPrestador ?? 0} readOnly precision={0.5} />
                                <Typography variant="body2" color="text.secondary">
                                  {ag.comentarioAvaliacaoPrestador}
                                </Typography>
                              </Box>
                            </Stack>
                          ) : (
                            // antes da paridade: mensagens + ação
                            <Stack spacing={1}>
                              {ag.avaliacaoClienteFeita && !ag.avaliacaoPrestadorFeita && (
                                <Typography variant="body2" color="text.secondary">
                                  O cliente já fez uma avaliação para você. Avalie para poder ver as duas.
                                </Typography>
                              )}

                              {!ag.avaliacaoClienteFeita && ag.avaliacaoPrestadorFeita && (
                                <Typography variant="body2" color="text.secondary">
                                  Você já realizou sua avaliação. Aguarde o cliente para que ambas fiquem visíveis.
                                </Typography>
                              )}

                              {!ag.avaliacaoClienteFeita && !ag.avaliacaoPrestadorFeita && (
                                <Typography variant="body2" color="text.secondary">
                                  Nenhuma avaliação registrada ainda.
                                </Typography>
                              )}

                              {/* botão aparece apenas se o PRESTADOR ainda não avaliou */}
                              {!ag.avaliacaoPrestadorFeita && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => abrirAvaliar(ag.idAgendamento)}
                                  sx={{ alignSelf: "flex-start" }}
                                >
                                  Avaliar cliente
                                </Button>
                              )}
                            </Stack>
                          )}
                        </Box>
                      </Box>

                      <Chip label={ag.statusAgendamento} color="success" size="small" />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Card>
      </Container>

      {/* Dialog no mesmo estilo das outras telas */}
      <Dialog
        open={avaliarOpen}
        onClose={() => setAvaliarOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          Avaliar cliente
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Rating
              value={avaliarNota}
              onChange={(_, v) => setAvaliarNota(v)}
              precision={0.5}
            />
            <TextField
              label="Como foi a comunicação, pontualidade e colaboração do cliente?"
              value={avaliarDescricao}
              onChange={(e) => setAvaliarDescricao(e.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvaliarOpen(false)}>Fechar</Button>
          <Button onClick={salvar} variant="contained" disabled={saving || !avaliarNota}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <TrocarTema/>
    </Box>
  );
}
