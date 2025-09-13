import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Container,
  Card,
  CardContent,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Search, SmartToy, AccountCircle, CalendarMonth, History } from "@mui/icons-material";
import TrocarTema from "../components/TrocarTema";
import { useUser } from "../contexts/UserContext";
import AgendamentosClienteList, { AgendamentoRespostaDTO } from "../components/AgendamentosClienteList";
import {useNavigate } from "react-router-dom";

const HomeCliente: React.FC = () => {
  const theme = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

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
            {/*Colocar ao clicar no icone de perfil */}
            <Button
              color="inherit"
              startIcon={<History />} onClick={() => navigate("/historico/cliente")}
              sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
            >
              Histórico
            </Button>
          </Box>


          {/* Perfil */}
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* CONTEÚDO */}
      <Container sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: "bold", color: "primary.main" }}>
          👋 Bem-vindo(a), {user.nome}!
        </Typography>

        <Card sx={{ backgroundColor: theme.palette.background.default, boxShadow: 4, borderRadius: 3, p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            <CalendarMonth sx={{ mr: 1, verticalAlign: "middle" }} />
            Meus Agendamentos
          </Typography>

          <AgendamentosClienteList clienteId={user.id} />
        </Card>
      </Container>
      <TrocarTema />
    </Box>
  );
};

export default HomeCliente;
