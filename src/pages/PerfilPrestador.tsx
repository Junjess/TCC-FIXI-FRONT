import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Typography,
  CircularProgress,
  Box,
  Avatar,
  Stack,
  Rating,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Card,
  CardContent,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { Search, SmartToy, AccountCircle, History } from "@mui/icons-material";
import {
  buscarPrestadorPorId,
  PrestadorDetalhesDTO,
} from "../services/prestadorService";
import {
  solicitarAgendamento,
  Periodo,
  listarAgendaPrestador,
  AgendaPrestadorDTO,
} from "../services/agendamentoService";
import TrocarTema from "../components/TrocarTema";
import { useUser } from "../contexts/UserContext";
import dayjs from "dayjs";

export default function PerfilPrestador() {
  const { id } = useParams<{ id: string }>();
  const [prestador, setPrestador] = useState<PrestadorDetalhesDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agendaDias, setAgendaDias] = useState<
    { data: string; ocupados: Periodo[]; bloqueadoCliente: boolean }[]
  >([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarError, setSnackbarError] = useState(false);

  const navigate = useNavigate();
  const { user } = useUser();
  const theme = useTheme();

  useEffect(() => {
    if (!id) return;

    async function fetchPrestador() {
      try {
        const data = await buscarPrestadorPorId(Number(id));
        setPrestador(data);
      } catch (err) {
        console.error("Erro ao carregar prestador:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrestador();
  }, [id]);

  const handleAgendar = async (data: string, periodo: Periodo) => {
    if (!id || !user) return;
    try {
      await solicitarAgendamento(Number(id), user.id, data, periodo);
      setSnackbarMsg("✅ Agendamento solicitado com sucesso!");
      setSnackbarError(false);
      setDialogOpen(false);
    } catch (err: any) {
      if (
        err.response?.status === 400 &&
        err.response?.data?.includes("já possui")
      ) {
        setSnackbarMsg("⚠️ Você já possui um agendamento ativo nesse dia.");
      } else {
        setSnackbarMsg(err.message || "Erro ao solicitar agendamento.");
      }
      setSnackbarError(true);
    }
    setSnackbarOpen(true);
  };

  const abrirDialog = async () => {
    if (!id || !user) return;
    const hoje = dayjs();
    const fromISO = hoje.format("YYYY-MM-DD");
    const toISO = hoje.add(14, "day").format("YYYY-MM-DD");

    try {
      const agenda = await listarAgendaPrestador(Number(id), fromISO, toISO);

      const dias = Array.from({ length: 7 }, (_, i) => {
        const data = hoje.add(i, "day").format("YYYY-MM-DD");

        const ocupados = agenda
          .filter(
            (a) => a.data === data && a.statusAgendamento === "ACEITO"
          )
          .map((a) => a.periodo as Periodo);

        const clienteTemAgendamento = agenda.some(
          (a) =>
            a.data === data &&
            a.statusAgendamento !== "RECUSADO" &&
            (a as AgendaPrestadorDTO).idAgendamento && 
            user.id 
        );

        return { data, ocupados, bloqueadoCliente: clienteTemAgendamento };
      });

      setAgendaDias(dias);
      setDialogOpen(true);
    } catch (err) {
      console.error("Erro ao carregar agenda:", err);
      setSnackbarMsg("Erro ao carregar agenda do prestador.");
      setSnackbarError(true);
      setSnackbarOpen(true);
    }
  };

  if (loading)
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  if (!prestador)
    return (
      <Typography align="center" sx={{ mt: 5 }}>
        Prestador não encontrado.
      </Typography>
    );

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.paper }}
    >
      {/* HEADER */}
      <AppBar position="static" sx={{ backgroundColor: "#395195" }}>
        <Toolbar>
          <Box
            component="img"
            src={require("../assets/LogoFixiDark.png")}
            alt="Logo Fixi"
            sx={{ width: 80, height: 40, cursor: "pointer" }}
            onClick={() => navigate("/home/cliente")}
          />

          <Box sx={{ ml: "auto" }}>
            <Button
              color="inherit"
              startIcon={<Search />}
              sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
              onClick={() => navigate("/search")}
            >
              Procurar Serviço
            </Button>

            <Button
              color="inherit"
              startIcon={<SmartToy />}
              sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
            >
              IA Recomendações
            </Button>

            <Button
              color="inherit"
              startIcon={<History />}
              sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
            >
              Histórico
            </Button>
          </Box>

          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* PERFIL DO PRESTADOR */}
      <Box sx={{ p: 4 }}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 4,
            backgroundColor: theme.palette.background.default,
            p: 3,
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              src={prestador.foto}
              sx={{ width: 100, height: 100, fontSize: 32 }}
            >
              {prestador.nome[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {prestador.nome}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {prestador.categoria}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {prestador.cidade}, {prestador.estado}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {prestador.telefone}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                <Rating value={prestador.mediaAvaliacao} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  {prestador.mediaAvaliacao.toFixed(1)} / 5
                </Typography>
              </Stack>

              <Button variant="contained" sx={{ mt: 2 }} onClick={abrirDialog}>
                Solicitar Agendamento
              </Button>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Sobre
          </Typography>
          <Typography>{prestador.descricao}</Typography>
        </Card>
      </Box>

      {/* Dialog de agendamento */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Solicitar Agendamento</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {agendaDias.map((dia) => (
              <Box
                key={dia.data}
                sx={{ border: "1px solid #ddd", borderRadius: 2, p: 2 }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {dayjs(dia.data).format("dddd, DD/MM")}
                </Typography>

                <Stack direction="row" spacing={2} mt={1}>
                  {(["MATUTINO", "VESPERTINO"] as Periodo[]).map((periodo) => {
                    const ocupado = dia.ocupados.includes(periodo);
                    const motivo = ocupado
                      ? "Já existe um agendamento ACEITO nesse período"
                      : dia.bloqueadoCliente
                      ? "Você já possui um agendamento nesse dia"
                      : undefined;

                    const disabled = ocupado || dia.bloqueadoCliente;

                    return (
                      <Tooltip key={periodo} title={motivo || ""} arrow>
                        <span>
                          <Button
                            variant="contained"
                            color={disabled ? "inherit" : "primary"}
                            disabled={disabled}
                            onClick={() => handleAgendar(dia.data, periodo)}
                          >
                            {periodo}
                          </Button>
                        </span>
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity={snackbarError ? "error" : "success"}
          sx={{ width: "100%" }}
          onClose={() => setSnackbarOpen(false)}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>

      <TrocarTema />
    </Box>
  );
}
