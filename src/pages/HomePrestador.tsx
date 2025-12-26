import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  useTheme,
  Container,
  Typography,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import { CalendarMonth } from "@mui/icons-material";
import TrocarTema from "../components/TrocarTema";
import {
  listarAgendamentosAceitosPorPrestador,
  AgendamentoRespostaDTO,
  cancelarAgendamentoPrestador,
} from "../services/agendamentoService";
import dayjs from "dayjs";
import {
  atualizarFotoPrestador,
  atualizarPrestador,
  PrestadorProfileDTO,
} from "../services/prestadorService";
import HeaderPrestador from "../components/prestador/HeaderPrestador";
import DialogEditarPrestador from "../components/prestador/DialogEditarPrestador";
import DialogDetalhesAgendamento from "../components/prestador/DialogDetalhesAgendamento";

type SnackbarType = {
  open: boolean;
  message: string;
  severity: "error" | "success" | "warning" | "info";
};

const HomePrestador: React.FC = () => {
  const { user, setUser } = useUser();
  const theme = useTheme();

  const [agendamentos, setAgendamentos] = useState<AgendamentoRespostaDTO[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [, setFormData] = useState<Partial<PrestadorProfileDTO>>({});
  const [, setFotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState<Set<number>>(new Set());
  const [dialogDetalhesOpen, setDialogDetalhesOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<AgendamentoRespostaDTO | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    if (!user) return;
    const prestador = user as PrestadorProfileDTO;

    const fetchAgendamentos = async () => {
      try {
        const data = await listarAgendamentosAceitosPorPrestador(prestador.id);
        const hoje = dayjs().startOf("day");
        const filtrados = data.filter(
          (ag) =>
            dayjs(ag.data).isSame(hoje, "day") ||
            dayjs(ag.data).isAfter(hoje, "day")
        );
        setAgendamentos(filtrados);
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, [user]);

  if (!user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const prestador = user as PrestadorProfileDTO;

  const categoriasUnicas = Array.from(
    new Set(agendamentos.map((ag) => ag.categoriaAgendamento).filter(Boolean))
  );

  const agendamentosFiltrados =
    categoriaSelecionada === "todos"
      ? agendamentos
      : agendamentos.filter((ag) => ag.categoriaAgendamento === categoriaSelecionada);

  const handleOpenDialog = () => {
    setFormData({
      nome: prestador.nome,
      email: prestador.email,
      telefone: prestador.telefone,
      cidade: prestador.cidade,
      estado: prestador.estado,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFotoFile(null);
  };

  const handleAbrirDetalhes = (ag: AgendamentoRespostaDTO) => {
    setAgendamentoSelecionado(ag);
    setDialogDetalhesOpen(true);
  };

  const handleFecharDetalhes = () => {
    setAgendamentoSelecionado(null);
    setDialogDetalhesOpen(false);
  };

  function formatarTelefone(telefone: string | null): string {
    if (!telefone) return "-";
    const apenasNumeros = telefone.replace(/\D/g, "");
    if (apenasNumeros.length === 11) {
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (apenasNumeros.length === 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return telefone;
  }

  const handleCancelar = async (idAgendamento: number) => {
    try {
      setCancelando((prev) => new Set(prev).add(idAgendamento));
      const resp = await cancelarAgendamentoPrestador(idAgendamento, prestador.id);
      setAgendamentos((prev) =>
        prev.filter((a) => a.idAgendamento !== idAgendamento)
      );
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
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.paper }}>
      <HeaderPrestador onEditarPerfil={handleOpenDialog} />

      <Container sx={{ mt: 5 }}>
        <Typography
          variant="h5"
          sx={{ mb: 4, fontWeight: "bold", color: "primary.main" }}
        >
          👋 Bem-vindo(a), {prestador.nome}!
        </Typography>

        {/* FILTRO DE CATEGORIAS */}
        <Stack spacing={2} direction="row" flexWrap="wrap" sx={{ mb: 3 }}>
          <ButtonGroup variant="outlined" color="primary">
            <Button
              onClick={() => setCategoriaSelecionada("todos")}
              variant={categoriaSelecionada === "todos" ? "contained" : "outlined"}
            >
              Todos
            </Button>
            {categoriasUnicas.map((cat, idx) => (
              <Button
                key={idx}
                onClick={() => setCategoriaSelecionada(cat!)}
                variant={categoriaSelecionada === cat ? "contained" : "outlined"}
              >
                {cat}
              </Button>
            ))}
          </ButtonGroup>
        </Stack>

        {/* LISTA DE AGENDAMENTOS */}
        <Card
          sx={{
            backgroundColor: theme.palette.background.default,
            boxShadow: 4,
            borderRadius: 3,
            p: 3,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            <CalendarMonth sx={{ mr: 1, verticalAlign: "middle" }} />
            Meus Agendamentos (Aceitos)
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : agendamentosFiltrados.length === 0 ? (
            <Typography color="text.secondary">
              {categoriaSelecionada === "todos"
                ? "Você não possui agendamentos aceitos no momento."
                : "Você não tem agendamentos nessa categoria."}
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {agendamentosFiltrados.map((ag, idx) => {
                const dataAg = dayjs(ag.data);

                return (
                  <Card
                    key={`${ag.idAgendamento}-${idx}`}
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
                          src={ag.fotoCliente ? `data:${ag.fotoTipoCliente ?? "image/jpeg"};base64,${ag.fotoCliente}` : undefined}
                          alt={ag.nomeCliente}
                          sx={{ width: 64, height: 64, fontSize: 24 }}
                        >
                          {ag.nomeCliente?.[0] ?? "?"}
                        </Avatar>

                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="bold">
                            {ag.nomeCliente}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Telefone: {formatarTelefone(ag.telefoneCliente)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ag.cidadeCliente}, {ag.estadoCliente}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Categoria: {ag.categoriaAgendamento}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Data: {dataAg.format("DD/MM/YYYY")} — {ag.periodo}
                          </Typography>
                        </Box>

                        <Stack direction="row" textAlign="right" gap={2}>
                          <Chip
                            label={ag.statusAgendamento}
                            color={
                              ag.statusAgendamento === "ACEITO"
                                ? "success"
                                : ag.statusAgendamento === "PENDENTE"
                                  ? "warning"
                                  : "error"
                            }
                            size="small"
                            sx={{ mt: 1.5, borderRadius: "4px" }}
                          />

                          {ag.statusAgendamento === "ACEITO" && (
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              sx={{ mt: 1 }}
                              onClick={() => handleCancelar(ag.idAgendamento)}
                              disabled={cancelando.has(ag.idAgendamento)}
                            >
                              {cancelando.has(ag.idAgendamento) ? "Cancelando..." : "Cancelar"}
                            </Button>

                          )}
                          <Button
                            variant="contained"
                            color="inherit"
                            size="small"
                            sx={{ mt: 1, bgcolor: theme.palette.background.default }}
                            onClick={() => handleAbrirDetalhes(ag)}
                          >
                            Detalhes
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Card>
      </Container>

      <DialogEditarPrestador
        open={openDialog}
        onClose={handleCloseDialog}
        user={prestador as PrestadorProfileDTO}
        loading={loading}
        onSave={async (formData, fotoFile) => {
          try {
            setLoading(true);
            let updated = prestador;

            if (Object.keys(formData).length > 0) {
              updated = await atualizarPrestador(prestador.id, formData);
            }

            if (fotoFile) {
              updated = await atualizarFotoPrestador(prestador.id, fotoFile);
            }

            setUser(updated); 
            handleCloseDialog();
          } catch (err) {
            console.error("Erro ao atualizar prestador", err);
            alert("Erro ao atualizar prestador");
          } finally {
            setLoading(false);
          }
        }}
      />

      <DialogDetalhesAgendamento
        open={dialogDetalhesOpen}
        agendamento={agendamentoSelecionado}
        onClose={handleFecharDetalhes}
        formatarTelefone={formatarTelefone}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", whiteSpace: "pre-line" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <TrocarTema />
    </Box>
  );
};

export default HomePrestador;
