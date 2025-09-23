import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
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
} from "../services/chatService";
import TrocarTema from "../components/TrocarTema";

const PageRecomendacoes: React.FC = () => {
    const [mensagens, setMensagens] = useState<MensagemDTO[]>([]);
    const [input, setInput] = useState("");
    const [iaDigitando, setIaDigitando] = useState(false);
    const [conversaSelecionada, setConversaSelecionada] = useState<number | null>(null);
    const [conversas, setConversas] = useState<ConversaDTO[]>([]);

    const theme = useTheme();
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    // 🔹 Buscar conversas ao iniciar
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

    // 🔹 Selecionar conversa existente
    const selecionarConversa = async (id: number) => {
        setConversaSelecionada(id);
        const msgs = await buscarMensagens(id);
        setMensagens(msgs);
    };

    // 🔹 Criar nova conversa (apenas reseta a tela)
    const novaConversa = () => {
        setConversaSelecionada(null);
        setMensagens([]);
    };

    // 🔹 Enviar mensagem
    const handleSend = async () => {
        if (!input.trim()) return;

        try {
            let conversaId = conversaSelecionada;

            // Se ainda não existe conversa -> cria primeiro
            if (!conversaId) {
                const nova = await criarConversa(user.id);
                conversaId = nova.id;
                setConversaSelecionada(conversaId);
                setConversas((prev) => [nova, ...prev].slice(0, 10));
            }

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
        }

        setInput("");
    };

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
            <HeaderCliente
                onEditarPerfil={() => { }}
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
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <TextField
                                            variant="standard"
                                            value={conv.titulo}
                                            onChange={(e) => {
                                                // Atualiza apenas no estado local (sem chamar API ainda)
                                                const novoTitulo = e.target.value;
                                                setConversas((prev) =>
                                                    prev.map((c) => (c.id === conv.id ? { ...c, titulo: novoTitulo } : c))
                                                );
                                            }}
                                            onBlur={async (e) => {
                                                // Quando sair do campo, salva no backend
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
                                        <Typography>{msg.texto}</Typography>
                                    </Box>
                                </Stack>
                            ))}

                            {iaDigitando && (
                                <Stack direction="row" spacing={1.5} alignItems="flex-end">
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
                                            fontStyle: "italic",
                                        }}
                                    >
                                        <Typography variant="body2">digitando...</Typography>
                                    </Box>
                                </Stack>
                            )}
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
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSend}
                                disabled={!input.trim()}
                                sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    "&:hover": { bgcolor: "primary.dark" },
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
            <TrocarTema />
        </Box>
    );
};

export default PageRecomendacoes;
