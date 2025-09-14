import { AccountCircle, History, Home, Search, SmartToy } from '@mui/icons-material'
import { AppBar, Avatar, Box, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Toolbar, Typography, useTheme } from '@mui/material'
import React, { useState } from 'react'
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import HistoricoClienteList from '../components/HistoricoClienteList';
import { atualizarCliente, atualizarFotoCliente, ClienteDTO } from '../services/clienteService';
import TrocarTema from '../components/TrocarTema';

function HistoricoCliente() {
    const theme = useTheme();
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState<Partial<ClienteDTO>>({});
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    if (!user) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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

    const handleSave = async () => {
        try {
            setLoading(true);

            // 🔹 Atualiza dados básicos (apenas campos alterados)
            if (Object.keys(formData).length > 0) {
                const updated = await atualizarCliente(user.id, formData);
                setUser(updated);
            }

            // 🔹 Atualiza foto se foi escolhida
            if (fotoFile) {
                const updated = await atualizarFotoCliente(user.id, fotoFile);
                setUser(updated);
            }

            handleCloseDialog();
        } catch (err) {
            console.error("Erro ao atualizar cliente", err);
            alert("Erro ao atualizar cliente");
        } finally {
            setLoading(false);
        }
    };

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
                                startIcon={<Home />}
                                sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
                                onClick={() => navigate("/home/cliente")}
                            >
                                Início
                            </Button>
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
                                onClick={() => navigate("/historico/cliente")}
                                sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
                            >
                                Histórico
                            </Button>
                        </Box>

                        {/* Perfil */}
                        <IconButton color="inherit" onClick={handleOpenDialog}>
                            {user.foto ? (
                                <Avatar
                                    src={`data:image/jpeg;base64,${user.foto}`}
                                    alt={user.nome}
                                />
                            ) : (
                                <AccountCircle />
                            )}
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
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
                >
                    <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
                        Editar Perfil
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} mt={1}>
                            <TextField
                                label="Nome"
                                name="nome"
                                value={formData.nome || ""}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="E-mail"
                                name="email"
                                value={formData.email || ""}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Telefone"
                                name="telefone"
                                value={formData.telefone || ""}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Cidade"
                                name="cidade"
                                value={formData.cidade || ""}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Estado"
                                name="estado"
                                value={formData.estado || ""}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Senha"
                                name="senha"
                                type="password"
                                value={formData.senha || ""}
                                onChange={handleChange}
                                fullWidth
                            />

                            <Button variant="outlined" component="label">
                                {fotoFile ? "Foto selecionada" : "Alterar Foto"}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) =>
                                        setFotoFile(e.target.files ? e.target.files[0] : null)
                                    }
                                />
                            </Button>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            disabled={loading}
                            sx={{ backgroundColor: "#395195" }}
                        >
                            {loading ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogActions>
                </Dialog>
                <TrocarTema/>
            </Box>
        </>
    )
}

export default HistoricoCliente