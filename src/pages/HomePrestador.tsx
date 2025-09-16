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
import {CalendarMonth} from "@mui/icons-material";
import TrocarTema from "../components/TrocarTema";
import {
  listarAgendamentosAceitosPorPrestador,
  AgendamentoRespostaDTO,
  cancelarAgendamentoPrestador,
} from "../services/agendamentoService";
import dayjs from "dayjs";
import { CategoriaDescricaoDTO } from "../services/procuraService";
import { atualizarFotoPrestador, atualizarPrestador } from "../services/prestadorService";
import HeaderPrestador from "../components/prestador/HeaderPrestador";
import DialogEditarPrestador from "../components/prestador/DialogEditarPrestador";


export type PrestadorProfileDTO = {
  id: number;
  nome: string;
  telefone: string;
  senha: string;
  foto: string;
  email: string;
  cep: string;
  cidade: string;
  estado: string;
  categorias: CategoriaDescricaoDTO[];
  mediaAvaliacao: number;
};

type SnackbarType = {
  open: boolean;
  message: string;
  severity: "error" | "success" | "warning" | "info";
};

const HomePrestador: React.FC = () => {
  const { user, setUser } = useUser();
  const theme = useTheme();

  const [agendamentos, setAgendamentos] = useState<AgendamentoRespostaDTO[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<PrestadorProfileDTO>>({});
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    if (!user) return;

    const fetchAgendamentos = async () => {
      try {
        const data = await listarAgendamentosAceitosPorPrestador(user.id);
        const hoje = dayjs().startOf("day");
        const filtrados = data.filter(
          (ag) => dayjs(ag.data).isSame(hoje, "day") || dayjs(ag.data).isAfter(hoje, "day")
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
    if (!user) return;
    try {
      await cancelarAgendamentoPrestador(idAgendamento, user.id);
      setAgendamentos((prev) => prev.filter((a) => a.idAgendamento !== idAgendamento));
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err);
      alert("Erro ao cancelar agendamento");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.paper }}>

      {/* HEADER */}
      <HeaderPrestador onEditarPerfil={handleOpenDialog} />

      {/* CONTEÚDO */}
      <Container sx={{ mt: 5 }}>
        {user && (
          <Typography variant="h5" sx={{ mb: 4, fontWeight: "bold", color: "primary.main" }}>
            👋 Bem-vindo(a), {user.nome}!
          </Typography>
        )}

        {/* Meus Agendamentos (Aceitos) */}
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
          ) : agendamentos.length === 0 ? (
            <Typography color="text.secondary">Você não possui agendamentos aceitos no momento.</Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {agendamentos.map((ag, idx) => {
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
                          src={ag.fotoCliente ?? undefined}
                          alt={ag.nomeCliente}
                          sx={{ width: 64, height: 64, fontSize: 24 }}
                        >
                          {ag.nomeCliente?.[0] ?? "?"}
                        </Avatar>

                        <Box flex={1}>
                          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                            <Typography variant="h6" fontWeight="bold">
                              {ag.nomeCliente}
                            </Typography>
                          </Stack>

                          <Typography variant="body2" color="text.secondary">
                            Telefone: {formatarTelefone(ag.telefoneCliente)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ag.cidadeCliente}, {ag.estadoCliente}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Data: {dataAg.format("DD/MM/YYYY")} — {ag.periodo}
                          </Typography>
                        </Box>

                        <Stack direction="column" textAlign="right">
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
                            sx={{ mt: 1, borderRadius: "4px" }}
                          />

                          {ag.statusAgendamento === "ACEITO" && (
                            <Button
                              variant="text"
                              color="error"
                              size="medium"
                              sx={{ mt: 1, bgcolor: theme.palette.background.default }}
                              onClick={() => handleCancelar(ag.idAgendamento)}
                            >
                              Cancelar
                            </Button>
                          )}
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
        user={user as PrestadorProfileDTO}
        loading={loading}
        onSave={async (formData, fotoFile) => {
          try {
            setLoading(true);

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
            setLoading(false);
          }
        }}
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
