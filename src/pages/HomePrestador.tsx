import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    useTheme,
    AppBar,
    Toolbar,
    Button,
    IconButton,
    Container,
} from "@mui/material";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { AccountCircle, CalendarMonth, BuildCircle, Star } from "@mui/icons-material";
import TrocarTema from "../components/TrocarTema";

type Agendamento = {
    id: number;
    clienteNome: string;
    servico: string;
    data: string;
    status: string;
};

const HomePrestador: React.FC = () => {
    const { user } = useUser();
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const theme = useTheme();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchAgendamentos = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/prestador/${user.id}/agendamentos`
                );
                setAgendamentos(response.data);
            } catch (error) {
                console.error("Erro ao carregar agendamentos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgendamentos();
    }, [user]);

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
                            startIcon={<BuildCircle />}
                            sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
                        >
                            Oferecer Serviço
                        </Button>
                        <Button
                            color="inherit"
                            startIcon={<Star />}
                            sx={{ textTransform: "none", fontWeight: "bold", mr: 3 }}
                        >
                            Minhas Avaliações
                        </Button>
                    </Box>


                    {/* Perfil */}
                    <IconButton color="inherit">
                        <AccountCircle fontSize="large" />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* CONTEÚDO */}
            <Container sx={{ mt: 5}}>
                {user && (
                    <Typography
                        variant="h5"
                        sx={{ mb: 4, fontWeight: "bold", color: "primary.main" }}
                    >
                        👋 Bem-vindo(a), {user.nome}!
                    </Typography>
                )}

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
                        Meus Agendamentos
                    </Typography>

                    {loading ? (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <CircularProgress />
                        </Box>
                    ) : agendamentos.length === 0 ? (
                        <Typography color="text.secondary">
                            Você não possui agendamentos no momento.
                        </Typography>
                    ) : (
                        <Box display="flex" flexDirection="column" gap={2} mt={2}>
                            {agendamentos.map((ag) => (
                                <Card key={ag.id} sx={{ boxShadow: 3, borderRadius: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6">{ag.servico}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Data: {new Date(ag.data).toLocaleDateString("pt-BR")}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: "bold",
                                                color:
                                                    ag.status === "CONFIRMADO"
                                                        ? "green"
                                                        : ag.status === "PENDENTE"
                                                            ? "orange"
                                                            : "red",
                                            }}
                                        >
                                            Status: {ag.status}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Card>
            </Container>
            <TrocarTema />
        </Box>
    );
};

export default HomePrestador;
