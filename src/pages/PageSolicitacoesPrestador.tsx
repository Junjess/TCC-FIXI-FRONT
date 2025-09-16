// src/pages/PageSolicitacoesPrestador.tsx
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
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
import {
  listarSolicitacoesPrestador,
  aceitarAgendamentoPrestador,
  recusarAgendamentoPrestador,
} from "../services/agendamentoService";
import { CalendarMonth } from "@mui/icons-material";
import TrocarTema from "../components/TrocarTema";
import dayjs from "dayjs";
import DialogEditarPrestador from "../components/prestador/DialogEditarPrestador";
import {
  atualizarFotoPrestador,
  atualizarPrestador,
} from "../services/prestadorService";
import { PrestadorProfileDTO } from "./HomePrestador";
import HeaderPrestador from "../components/prestador/HeaderPrestador";

type AgendamentoSolicitacao = {
  idAgendamento: number;
  data: string;
  periodo: "MATUTINO" | "VESPERTINO" | string;
  statusAgendamento: "PENDENTE" | "ACEITO" | "RECUSADO" | string;
  idCliente: number;
  nomeCliente?: string;
  telefoneCliente?: string;
  fotoCliente?: string | null;
  servico?: string;
};

const PageSolicitacoesPrestador: React.FC = () => {
  const { user, setUser } = useUser();
  const theme = useTheme();

  const [solicitacoes, setSolicitacoes] = useState<AgendamentoSolicitacao[]>([]);
  const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(true);
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<PrestadorProfileDTO>>({});
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        setLoadingSolicitacoes(true);
        const data = await listarSolicitacoesPrestador(user.id);
        setSolicitacoes(data);
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: "Erro ao carregar solicitações.",
          severity: "error",
        });
      } finally {
        setLoadingSolicitacoes(false);
      }
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <Box p={4}>
        <Typography variant="h6">
          Você precisa estar logado como prestador para ver as solicitações.
        </Typography>
      </Box>
    );
  }

  const handleOpenDialog = () => {
    setFormData({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      cidade: user.cidade,
      estado: user.estado,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFotoFile(null);
  };

  const handleAceitar = async (id: number) => {
    if (!user) return;
    setProcessingId(id);
    const prev = [...solicitacoes];
    setSolicitacoes((s) => s.filter((x) => x.idAgendamento !== id));

    try {
      await aceitarAgendamentoPrestador(user.id, id);
      setSnackbar({
        open: true,
        message: "Agendamento aceito.",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSolicitacoes(prev);
      setSnackbar({
        open: true,
        message: "Falha ao aceitar agendamento.",
        severity: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRecusar = async (id: number) => {
    if (!user) return;
    setProcessingId(id);
    const prev = [...solicitacoes];
    setSolicitacoes((s) => s.filter((x) => x.idAgendamento !== id));

    try {
      await recusarAgendamentoPrestador(user.id, id);
      setSnackbar({
        open: true,
        message: "Agendamento recusado.",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSolicitacoes(prev);
      setSnackbar({
        open: true,
        message: "Falha ao recusar agendamento.",
        severity: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  function formatarTelefone(telefone?: string | null): string {
    if (!telefone) return "-";
    const apenasNumeros = telefone.replace(/\D/g, "");
    if (apenasNumeros.length === 11) {
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (apenasNumeros.length === 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return telefone;
  }

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.paper }}
    >
      <HeaderPrestador onEditarPerfil={handleOpenDialog} />

      {/* CONTEÚDO */}
      <Container sx={{ mt: 5 }}>
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
            Solicitações Recebidas
          </Typography>

          {loadingSolicitacoes ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : solicitacoes.length === 0 ? (
            <Typography color="text.secondary">
              Não há solicitações pendentes no momento.
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {solicitacoes.map((s, idx) => {
                const dataAg = dayjs(s.data);

                return (
                  <Card
                    key={`${s.idAgendamento}-${idx}`}
                    sx={{
                      bgcolor: theme.palette.background.paper,
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
                            s.fotoCliente
                              ? `data:image/jpeg;base64,${s.fotoCliente}`
                              : undefined
                          }
                          alt={s.nomeCliente}
                          sx={{ width: 64, height: 64, fontSize: 24 }}
                        >
                          {s.nomeCliente?.[0] ?? "?"}
                        </Avatar>

                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="bold">
                            {s.nomeCliente ?? "Cliente"}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            Telefone: {formatarTelefone(s.telefoneCliente)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Data: {dataAg.format("DD/MM/YYYY")} — {s.periodo}
                          </Typography>
                          {s.servico && (
                            <Typography variant="body2" color="text.secondary">
                              Serviço: {s.servico}
                            </Typography>
                          )}
                        </Box>

                        <Box minWidth={200} textAlign="right">
                          <Chip
                            label={s.statusAgendamento}
                            color={
                              s.statusAgendamento === "PENDENTE"
                                ? "warning"
                                : s.statusAgendamento === "ACEITO"
                                ? "success"
                                : "error"
                            }
                            size="small"
                            sx={{ mt: 1, mr: 5, borderRadius: "4px" }}
                          />
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            sx={{ mt: 1 }}
                          >
                            <Button
                              variant="text"
                              color="error"
                              size="medium"
                              sx={{ bgcolor: theme.palette.background.default }}
                              disabled={processingId === s.idAgendamento}
                              onClick={() => handleRecusar(s.idAgendamento)}
                            >
                              {processingId === s.idAgendamento ? (
                                <CircularProgress size={18} />
                              ) : (
                                "Recusar"
                              )}
                            </Button>
                            <Button
                              variant="contained"
                              size="medium"
                              disabled={processingId === s.idAgendamento}
                              onClick={() => handleAceitar(s.idAgendamento)}
                            >
                              {processingId === s.idAgendamento ? (
                                <CircularProgress size={18} />
                              ) : (
                                "Aceitar"
                              )}
                            </Button>
                          </Stack>
                        </Box>
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
        user={user as PrestadorProfileDTO}
        loading={loadingSalvar}
        onSave={async (formData, fotoFile) => {
          try {
            setLoadingSalvar(true);

            if (Object.keys(formData).length > 0) {
              const updated = await atualizarPrestador(user.id, formData);
              setUser(updated);
            }

            if (fotoFile) {
              const updated = await atualizarFotoPrestador(user.id, fotoFile);
              setUser(updated);
            }

            handleCloseDialog();
          } catch (err) {
            console.error("Erro ao atualizar prestador", err);
            alert("Erro ao atualizar prestador");
          } finally {
            setLoadingSalvar(false);
          }
        }}
      />

      <TrocarTema />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PageSolicitacoesPrestador;
