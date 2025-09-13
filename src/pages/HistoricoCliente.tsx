import { AccountCircle, History, Search, SmartToy } from '@mui/icons-material'
import { AppBar, Box, Button, Card, Container, IconButton, Toolbar, Typography, useTheme } from '@mui/material'
import React from 'react'
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import HistoricoClienteList from '../components/HistoricoClienteList';

function HistoricoCliente() {
    const theme = useTheme();
    const { user } = useUser();
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

    return (
        <>
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
                <Container sx={{ mt: 5 }}>
                    <Card sx={{ backgroundColor: theme.palette.background.default, boxShadow: 4, borderRadius: 3, p: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                            Histórico de Agendamentos
                        </Typography>
                        <HistoricoClienteList clienteId={user.id} />
                    </Card>
                </Container>
            </Box>
        </>
    )
}

export default HistoricoCliente