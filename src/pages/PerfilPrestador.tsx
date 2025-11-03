import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Typography,
  CircularProgress,
  Box,
  Avatar,
  Stack,
  Rating,
  Button,
  Card,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  buscarPrestadorPorId,
  PrestadorDetalhesDTO,
} from "../services/prestadorService";
import {
  solicitarAgendamento,
  Periodo,
  listarAgendaPrestador,
} from "../services/agendamentoService";
import TrocarTema from "../components/TrocarTema";
import { useUser } from "../contexts/UserContext";
import dayjs from "dayjs";
import HeaderCliente from "../components/cliente/HeaderCliente";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

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
  const { user, setUser } = useUser();
  const theme = useTheme();

  const [categoriaId, setCategoriaId] = useState<number>(0);
  const [descricaoServico, setDescricaoServico] = useState("");
  const [valorSugerido, setValorSugerido] = useState<number | "">("");

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
    if (!id || !user || !categoriaId) {
      setSnackbarMsg("⚠️ Selecione uma categoria antes de agendar.");
      setSnackbarError(true);
      setSnackbarOpen(true);
      return;
    }

    try {
      await solicitarAgendamento(
        user.id,
        Number(id),
        categoriaId,
        data,
        periodo,
        descricaoServico,
        valorSugerido === "" ? null : Number(valorSugerido)
      );

      setSnackbarMsg("✅ Agendamento solicitado com sucesso!");
      setSnackbarError(false);
      setDialogOpen(false);
      setDescricaoServico("");
      setValorSugerido("");
    } catch (err: any) {
      if (
        err.response?.status === 400 &&
        err.response?.data?.includes("já possui")
      ) {
        setSnackbarMsg("⚠️ Você já possui um agendamento ativo nesse período.");
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
            (a) =>
              a.data === data &&
              (a.statusAgendamento === "PENDENTE" || a.statusAgendamento === "ACEITO")
          )
          .map((a) => a.periodo as Periodo);

        return { data, ocupados, bloqueadoCliente: false };
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
      {/* HEADER reaproveitado */}
      <HeaderCliente
        onEditarPerfil={() => navigate("/home/cliente")}
        onLogout={() => {
          setUser(null);
          navigate("/main");
        }}
      />

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
              src={prestador.foto ? `data:image/jpeg;base64,${prestador.foto}` : undefined}
              sx={{ width: 100, height: 100, fontSize: 32 }}
            >
              {prestador.nome[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {prestador.nome}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                {prestador.categorias?.map((c, idx) => (
                  <Chip
                    key={idx}
                    label={`${c.nomeCategoria}${c.descricao ? ` - ${c.descricao}` : ""}`}
                    color="primary"
                    size="small"
                  />
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {prestador.cidade}, {prestador.estado}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {prestador.telefone}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                <Rating value={prestador.mediaAvaliacao} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  Avaliação Clientes: {prestador.mediaAvaliacao.toFixed(1)} / 5
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                <Rating value={prestador.notaPlataforma} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  Avaliação Plataforma: {prestador.notaPlataforma.toFixed(1)} / 5
                </Typography>
              </Stack>

              <Button variant="contained" sx={{ mt: 2 }} onClick={abrirDialog}>
                Solicitar Agendamento
              </Button>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* SOBRE */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Sobre
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {prestador.sobre}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* AVALIAÇÕES */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Avaliações
          </Typography>

          {prestador.avaliacoes && prestador.avaliacoes.length > 0 ? (
            <Stack spacing={2}>
              {prestador.avaliacoes.map((avaliacao, idx) => (
                <Card key={idx} sx={{ borderRadius: 2, boxShadow: 2, p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar>{avaliacao.clienteNome[0]}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {avaliacao.clienteNome}
                      </Typography>
                      <Rating
                        value={avaliacao.nota}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {avaliacao.descricao}
                  </Typography>
                </Card>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhuma avaliação ainda.
            </Typography>
          )}
        </Card>
      </Box>

      {/* Dialog de agendamento */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Solicitar Agendamento</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="categoria-label">Categoria</InputLabel>
              <Select
                required
                labelId="categoria-label"
                value={categoriaId ?? ""}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                {prestador?.categorias?.map((c, idx) => (
                  <MenuItem key={idx} value={c.nomeCategoria}>
                    {c.nomeCategoria}
                    {c.descricao ? ` - ${c.descricao}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Campo de descrição do serviço */}
            <TextField
              label="Descrição do serviço"
              required
              fullWidth
              multiline
              rows={3}
              value={descricaoServico}
              onChange={(e) => setDescricaoServico(e.target.value)}
            />

            {/*   Campo de valor sugerido */}
            <TextField
              label="Valor sugerido (R$)"
              type="number"
              fullWidth
              value={valorSugerido}
              onChange={(e) =>
                setValorSugerido(e.target.value === "" ? "" : Number(e.target.value))
              }
            />

            {agendaDias.map((dia) => (
              <Box
                key={dia.data}
                sx={{ border: "1px solid #ddd", borderRadius: 2, p: 2 }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {dayjs(dia.data)
                    .format("dddd, DD/MM")
                    .replace(/^([a-z])/g, (letra) => letra.toUpperCase())}
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
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
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
