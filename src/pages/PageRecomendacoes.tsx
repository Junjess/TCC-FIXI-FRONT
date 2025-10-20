import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Container,
    Stack,
    TextField,
    IconButton,
    Paper,
    Typography,
    Divider,
    useTheme,
    CircularProgress,
    Avatar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import HeaderCliente from "../components/cliente/HeaderCliente";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import {
    criarConversa,
    buscarMensagens,
    salvarMensagem,
    buscarConversas,
    atualizarTituloConversa,
    MensagemDTO,
    ConversaDTO,
    excluirConversa,
} from "../services/chatService";
import TrocarTema from "../components/TrocarTema";
import ReactMarkdown from "react-markdown";
import { atualizarCliente, atualizarFotoCliente, ClienteDTO } from "../services/clienteService";

const PageRecomendacoes: React.FC = () => {
    const [mensagens, setMensagens] = useState<MensagemDTO[]>([]);
    const [input, setInput] = useState("");
    const [iaDigitando, setIaDigitando] = useState(false);
    const [conversaSelecionada, setConversaSelecionada] = useState<number | null>(null);
    const [conversas, setConversas] = useState<ConversaDTO[]>([]);

    const theme = useTheme();
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [conversaParaExcluir, setConversaParaExcluir] = useState<number | null>(null);

    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState<Partial<ClienteDTO>>({});
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [previewFoto, setPreviewFoto] = useState<string | null>(null);

    const [viaCepLoading, setViaCepLoading] = useState(false);
    const [viaCepError, setViaCepError] = useState<string | null>(null);

    //  Ref para auto-scroll
    const endRef = useRef<HTMLDivElement | null>(null);
    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [mensagens, iaDigitando]);

    const confirmarExclusao = (id: number) => {
        setConversaParaExcluir(id);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setConversaParaExcluir(null);
    };

    const handleClosePerfilDialog = () => {
        setOpenDialog(false);
        setFormData({});
        setFotoFile(null);
    };

    // Consulta ViaCEP
    const buscarCidadeEstadoPorCep = async (cep: string) => {
        const cepNum = cep.replace(/\D/g, "");
        if (cepNum.length !== 8) {
            setViaCepError("CEP deve conter 8 dígitos.");
            return;
        }

        try {
            setViaCepLoading(true);
            setViaCepError(null);

            const resp = await fetch(`https://viacep.com.br/ws/${cepNum}/json/`);
            const data = await resp.json();

            if (data?.erro) {
                setViaCepError("CEP não encontrado.");
                setFormData((prev) => ({
                    ...prev,
                    cidade: "",
                    estado: "",
                }));
                return;
            }

            setFormData((prev) => ({
                ...prev,
                cep: cep,
                cidade: data.localidade || "",
                estado: data.uf || "",
            }));
        } catch (err) {
            console.error("Erro ao consultar ViaCEP", err);
            setViaCepError("Erro ao buscar CEP. Tente novamente.");
        } finally {
            setViaCepLoading(false);
        }
    };

    const handleConfirmarExclusao = async () => {
        if (conversaParaExcluir !== null) {
            try {
                await excluirConversa(conversaParaExcluir);
                setConversas((prev) => prev.filter((c) => c.id !== conversaParaExcluir));

                if (conversaSelecionada === conversaParaExcluir) {
                    setConversaSelecionada(null);
                    setMensagens([]);
                }
            } catch (err) {
                console.error("Erro ao excluir conversa", err);
            }
        }
        handleCloseDialog();
    };

    //  Buscar conversas ao iniciar
    useEffect(() => {
        const init = async () => {
            if (!user) return;
            try {
                const lista = await buscarConversas(user.id);
                setConversas(Array.isArray(lista) ? lista : []); // ✅ garante array
            } catch (err) {
                console.error("Erro ao buscar conversas", err);
                setConversas([]); // evita erro
            }
        };
        init();
    }, [user]);

    if (!user) {
        return null;
    }



    //  Selecionar conversa existente
    const selecionarConversa = async (id: number) => {
        setConversaSelecionada(id);
        const msgs = await buscarMensagens(id);
        setMensagens(msgs);
    };

    const novaConversa = () => {
        setConversaSelecionada(null);
        setMensagens([]);
    };

    const handleSend = async () => {
        if (!input.trim() || iaDigitando) return;

        try {
            let conversaId = conversaSelecionada;

            // Se ainda não existe conversa -> cria primeiro
            if (!conversaId) {
                const nova = await criarConversa(user.id);
                conversaId = nova.id;
                setConversaSelecionada(conversaId);
                setConversas((prev) => [nova, ...prev].slice(0, 10));
            }

            // Ativa indicador de "IA digitando"
            setIaDigitando(true);

            // Envia mensagem do cliente
            const res = await salvarMensagem(conversaId, {
                autor: "CLIENTE",
                texto: input,
            });

            setMensagens((prev) => [
                ...prev,
                res.mensagem,
                ...(res.respostaIA ? [res.respostaIA] : []),
            ]);
        } catch (err) {
            console.error("Erro ao enviar mensagem", err);
            // Mensagem de erro da IA
            setMensagens((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    autor: "IA",
                    texto: "❌ Erro ao obter resposta no momento. Tente novamente.",
                    dataHora: new Date().toISOString(),
                } as MensagemDTO,
            ]);
        } finally {
            setIaDigitando(false);
            setInput("");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFotoFile(file);
            setPreviewFoto(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!user) return;
        try {
            setLoading(true);
            let updated = user;

            if (Object.keys(formData).length > 0) {
                updated = await atualizarCliente(user.id, formData);
            }

            if (fotoFile) {
                updated = await atualizarFotoCliente(user.id, fotoFile);
            }

            setUser(updated);
            handleCloseDialog();
        } catch (err) {
            console.error("Erro ao atualizar perfil", err);
            alert("Erro ao atualizar perfil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
            <HeaderCliente
                onEditarPerfil={() => {
                    setFormData(user);
                    setOpenDialog(true);
                }}
                onLogout={() => {
                    setUser(null);
                    navigate("/main");
                }}
            />

            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Stack direction="row" spacing={2} sx={{ height: "85vh" }}>
                    {/* Sidebar */}
                    <Paper
                        elevation={3}
                        sx={{ width: "25%", p: 2, display: "flex", flexDirection: "column", borderRadius: 3 }}
                    >
                        {/* Botão nova conversa */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            mb={2}
                            sx={{ cursor: "pointer" }}
                            onClick={novaConversa}
                        >
                            <AddIcon color="primary" />
                            <Typography variant="subtitle1" color="primary">
                                Nova conversa
                            </Typography>
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        {/* Lista de conversas */}
                        <Stack spacing={1} sx={{ overflowY: "auto" }}>
                            {conversas.map((conv) => (
                                <Paper
                                    key={conv.id}
                                    elevation={1}
                                    sx={{
                                        p: 1.5,
                                        cursor: "pointer",
                                        bgcolor: conversaSelecionada === conv.id ? "primary.light" : theme.palette.background.default,
                                    }}
                                    onClick={() => selecionarConversa(conv.id)}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                        <TextField
                                            variant="standard"
                                            value={conv.titulo}
                                            onChange={(e) => {
                                                const novoTitulo = e.target.value;
                                                setConversas((prev) =>
                                                    prev.map((c) => (c.id === conv.id ? { ...c, titulo: novoTitulo } : c))
                                                );
                                            }}
                                            onBlur={async (e) => {
                                                try {
                                                    const updated = await atualizarTituloConversa(conv.id, e.target.value);
                                                    setConversas((prev) =>
                                                        prev.map((c) => (c.id === conv.id ? updated : c))
                                                    );
                                                } catch (err) {
                                                    console.error("Erro ao atualizar título", err);
                                                }
                                            }}
                                            onKeyDown={async (e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    try {
                                                        const updated = await atualizarTituloConversa(conv.id, (e.target as HTMLInputElement).value);
                                                        setConversas((prev) =>
                                                            prev.map((c) => (c.id === conv.id ? updated : c))
                                                        );
                                                    } catch (err) {
                                                        console.error("Erro ao atualizar título", err);
                                                    }
                                                }
                                            }}
                                            InputProps={{
                                                disableUnderline: true,
                                                style: { fontWeight: 600 },
                                            }}
                                            sx={{ flex: 1 }}
                                        />

                                        {/* Botão excluir conversa */}
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmarExclusao(conv.id);
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>

                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(conv.dataInicio).toLocaleDateString()}
                                    </Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Paper>

                    {/* Chat */}
                    <Paper
                        elevation={4}
                        sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", borderRadius: 3 }}
                    >
                        {/* Histórico de mensagens */}
                        <Stack spacing={2} sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
                            {mensagens.map((msg, i) => (
                                <Stack
                                    key={i}
                                    direction={msg.autor === "CLIENTE" ? "row-reverse" : "row"}
                                    spacing={1.5}
                                    alignItems="flex-end"
                                >
                                    <Avatar sx={{ bgcolor: msg.autor === "CLIENTE" ? "primary.main" : "grey.400" }}>
                                        {msg.autor === "CLIENTE" ? <PersonIcon /> : <SmartToyIcon />}
                                    </Avatar>
                                    <Box
                                        sx={{
                                            bgcolor: msg.autor === "CLIENTE" ? "primary.main" : theme.palette.background.default,
                                            color: msg.autor === "CLIENTE" ? "primary.contrastText" : "text.primary",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 3,
                                            boxShadow: 2,
                                            maxWidth: "70%",
                                        }}
                                    >
                                        <ReactMarkdown>{msg.texto}</ReactMarkdown>
                                    </Box>
                                </Stack>
                            ))}

                            {/* Indicador de digitação da IA com spinner */}
                            {iaDigitando && (
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar sx={{ bgcolor: "grey.400" }}>
                                        <SmartToyIcon />
                                    </Avatar>
                                    <Box
                                        sx={{
                                            bgcolor: "grey.200",
                                            color: "text.primary",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 3,
                                            boxShadow: 2,
                                            maxWidth: "70%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        <CircularProgress size={18} />
                                        <Typography variant="body2">A IA está digitando...</Typography>
                                    </Box>
                                </Stack>
                            )}

                            {/* âncora para auto-scroll */}
                            <div ref={endRef} />
                        </Stack>

                        <Divider />

                        {/* Campo de entrada */}
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                placeholder="Digite sua mensagem..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                disabled={false}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSend}
                                disabled={!input.trim() || iaDigitando}
                                sx={{
                                    bgcolor: (!input.trim() || iaDigitando) ? "action.disabledBackground" : "primary.main",
                                    color: (!input.trim() || iaDigitando) ? "text.disabled" : "white",
                                    "&:hover": { bgcolor: (!input.trim() || iaDigitando) ? "action.disabledBackground" : "primary.dark" },
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>

            {/* Dialog de confirmação */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Excluir conversa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza de que deseja excluir esta conversa? Essa ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleConfirmarExclusao} color="error" variant="contained">
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDialog}
                onClose={handleClosePerfilDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
                    Editar Perfil
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1} alignItems="center">
                        {/* Foto de perfil */}
                        <Avatar
                            src={
                                previewFoto ||
                                (user?.foto && user?.fotoTipo
                                    ? `data:${user.fotoTipo};base64,${user.foto}`
                                    : undefined)
                            }
                            alt={formData.nome || "Foto"}
                            sx={{ width: 120, height: 120, mb: 2 }}
                        />

                        <Button variant="outlined" component="label">
                            {fotoFile ? "Foto selecionada" : "Alterar Foto"}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleFotoChange}
                            />
                        </Button>

                        {/* Nome */}
                        <TextField
                            label="Nome"
                            name="nome"
                            value={formData.nome || ""}
                            onChange={handleChange}
                            fullWidth
                        />

                        {/* Email */}
                        <TextField
                            label="E-mail"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            fullWidth
                        />

                        {/* Telefone */}
                        <TextField
                            label="Telefone"
                            name="telefone"
                            value={formData.telefone || ""}
                            onChange={handleChange}
                            fullWidth
                        />

                        {/* CEP */}
                        <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ width: "100%" }}>
                            <TextField
                                label="CEP"
                                name="cep"
                                value={formData.cep || ""}
                                onChange={(e) => {
                                    setFormData({ ...formData, cep: e.target.value });
                                    if (e.target.value.replace(/\D/g, "").length === 8) {
                                        buscarCidadeEstadoPorCep(e.target.value);
                                    } else {
                                        setViaCepError(null);
                                    }
                                }}
                                fullWidth
                                error={Boolean(viaCepError)}
                                helperText={viaCepError || "Digite o CEP para preencher cidade e estado automaticamente"}
                            />
                            {viaCepLoading && <CircularProgress size={24} />}
                        </Stack>

                        {/* Cidade (readOnly) */}
                        <TextField
                            label="Cidade"
                            name="cidade"
                            value={formData.cidade || ""}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />

                        {/* Estado (readOnly) */}
                        <TextField
                            label="Estado"
                            name="estado"
                            value={formData.estado || ""}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />

                        {/* Senha */}
                        <TextField
                            label="Senha"
                            name="senha"
                            type="password"
                            value={formData.senha || ""}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePerfilDialog}>Cancelar</Button>
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

            <TrocarTema />
        </Box>
    );
};

export default PageRecomendacoes;
