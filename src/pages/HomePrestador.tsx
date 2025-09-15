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
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Typography,
  Stack,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import { AccountCircle, CalendarMonth, BuildCircle, Star, Home } from "@mui/icons-material";
import TrocarTema from "../components/TrocarTema";
import {
  listarAgendamentosAceitosPorPrestador,
  AgendamentoRespostaDTO,
  cancelarAgendamentoPrestador,
} from "../services/agendamentoService";
import dayjs from "dayjs";

const HomePrestador: React.FC = () => {
  const { user } = useUser();
  const [agendamentos, setAgendamentos] = useState<AgendamentoRespostaDTO[]>([]);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

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

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.paper }}>
      {/* HEADER */}
      <AppBar position="static" sx={{ backgroundColor: "#395195" }}>
        <Toolbar>
          <Box
            component="img"
            src={require("../assets/LogoFixiDark.png")}
            alt="Logo Fixi"
            sx={{ width: 80, height: 40, cursor: "pointer" }}
          />

          <Box sx={{ ml: "auto" }}>
            <Button color="inherit" startIcon={<Home />} sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}>
              Início
            </Button>
            <Button color="inherit" startIcon={<BuildCircle />} sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}>
              Solicitação de Agendamento
            </Button>
            <Button color="inherit" startIcon={<Star />} sx={{ textTransform: "none", fontWeight: "bold", mr: 3 }}>
              Minhas Avaliações
            </Button>
          </Box>

          <IconButton color="inherit">
            <AccountCircle fontSize="large" />
          </IconButton>
        </Toolbar>
      </AppBar>

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

                        <Box minWidth={200} textAlign="right">
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
                            sx={{ mt: 1 }}
                          />

                          {ag.statusAgendamento === "ACEITO" && (
                            <Button
                              variant="text"
                              color="error"
                              size="small"
                              sx={{ mt: 1 }}
                              onClick={() => handleCancelar(ag.idAgendamento)}
                            >
                              Cancelar
                            </Button>
                          )}
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

      <TrocarTema />
    </Box>
  );
};

export default HomePrestador;
