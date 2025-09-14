import { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Rating,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { cancelarAgendamento, listarAgendamentosPorCliente } from "../services/agendamentoService";
import { salvarAvaliacao } from "../services/avaliacaoService";
import { useUser } from "../contexts/UserContext";
import dayjs from "dayjs";

type Props = {
    clienteId: number;
};

export type AgendamentoRespostaDTO = {
    idAgendamento: number;
    idPrestador: number;
    nomePrestador: string;
    telefonePrestador: string;
    fotoPrestador: string | null;
    cidadePrestador: string | null;
    estadoPrestador: string | null;
    categoriaPrestador: string | null;
    data: string; // "YYYY-MM-DD"
    periodo: string;
    statusAgendamento: string; // "ACEITO" | "PENDENTE"
    avaliado: boolean;
    nota?: number;
    descricaoAvaliacao?: string;
};

export default function AgendamentosClienteList({ clienteId }: Props) {
    const [itens, setItens] = useState<AgendamentoRespostaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    // dialog avaliação
    const [avaliarOpen, setAvaliarOpen] = useState(false);
    const [avaliarNota, setAvaliarNota] = useState<number | null>(0);
    const [avaliarDescricao, setAvaliarDescricao] = useState("");
    const [avaliarAgendamentoId, setAvaliarAgendamentoId] = useState<number | null>(null);

    const { user } = useUser();

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setErro(null);

        listarAgendamentosPorCliente(clienteId)
            .then((res) => {
                if (isMounted) {
                    // ✅ só tira os avaliados, deixa o resto
                    setItens(res.filter((a) => !a.avaliado));
                }
            })
            .catch((e) => {
                if (isMounted)
                    setErro(e?.response?.data?.message ?? "Falha ao carregar agendamentos.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [clienteId]);


    async function handleCancelar(idAgendamento: number) {
        if (!user) return;
        try {
            await cancelarAgendamento(idAgendamento, user.id);
            setItens((prev) => prev.filter((a) => a.idAgendamento !== idAgendamento));
        } catch (e) {
            console.error("Erro ao cancelar agendamento:", e);
        }
    }

    function abrirAvaliar(idAgendamento: number) {
        setAvaliarAgendamentoId(idAgendamento);
        setAvaliarNota(0);
        setAvaliarDescricao("");
        setAvaliarOpen(true);
    }

    async function salvar() {
        if (!avaliarAgendamentoId) return;
        try {
            await salvarAvaliacao({
                agendamentoId: avaliarAgendamentoId,
                nota: avaliarNota ?? 0,
                descricao: avaliarDescricao,
            });

            // ✅ remove o agendamento avaliado da lista
            setItens((prev) => prev.filter((a) => a.idAgendamento !== avaliarAgendamentoId));

            setAvaliarOpen(false);
        } catch (e) {
            console.error("Erro ao salvar avaliação:", e);
            alert("Erro ao salvar avaliação.");
        }
    }

    if (loading) {
        return (
            <Stack alignItems="center" justifyContent="center" sx={{ p: 4 }}>
                <CircularProgress />
            </Stack>
        );
    }

    if (erro) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="error">{erro}</Typography>
            </Box>
        );
    }

    if (itens.length === 0) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography>Nenhum agendamento encontrado.</Typography>
            </Box>
        );
    }

    return (
        <>
            <Stack spacing={2} sx={{ p: 2 }}>
                {itens.map((ag, idx) => {
                    const dataAg = dayjs(ag.data);
                    const hoje = dayjs().startOf("day");
                    const dataFutura = !dataAg.isBefore(hoje);
                    const dataPassada = dataAg.isBefore(hoje);

                    return (
                        <Card
                            key={`${ag.idPrestador}-${ag.data}-${idx}`}
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
                                        src={ag.fotoPrestador ?? undefined}
                                        alt={ag.nomePrestador}
                                        sx={{ width: 64, height: 64, fontSize: 24 }}
                                    >
                                        {ag.nomePrestador?.[0] ?? "?"}
                                    </Avatar>

                                    <Box flex={1}>
                                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                            <Typography variant="h6" fontWeight="bold">
                                                {ag.nomePrestador}
                                            </Typography>
                                            {ag.categoriaPrestador && (
                                                <Chip
                                                    size="small"
                                                    color="primary"
                                                    label={ag.categoriaPrestador}
                                                    sx={{ fontWeight: 500 }}
                                                />
                                            )}
                                        </Stack>

                                        <Typography variant="body2" color="text.secondary">
                                            {ag.cidadePrestador ?? "-"}
                                            {ag.estadoPrestador ? `, ${ag.estadoPrestador}` : ""}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {ag.telefonePrestador ?? "-"}
                                        </Typography>
                                    </Box>

                                    <Box minWidth={200} textAlign="right">
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Data
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {dataAg.format("DD/MM/YYYY")}
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {ag.periodo}
                                        </Typography>

                                        {/* 1) PENDENTE → chip + cancelar */}
                                        {ag.statusAgendamento === "PENDENTE" && (
                                            <>
                                                <Chip label="PENDENTE" color="warning" size="small" sx={{ mt: 1 }} />
                                                <Button
                                                    variant="text"
                                                    color="error"
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                    onClick={() => handleCancelar(ag.idAgendamento)}
                                                >
                                                    Cancelar
                                                </Button>
                                            </>
                                        )}

                                        {/* 2) ACEITO e data futura → chip + cancelar */}
                                        {ag.statusAgendamento === "ACEITO" && dataFutura && (
                                            <>
                                                <Chip label="ACEITO" color="success" size="small" sx={{ mt: 1 }} />
                                                <Button
                                                    variant="text"
                                                    color="error"
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                    onClick={() => handleCancelar(ag.idAgendamento)}
                                                >
                                                    Cancelar
                                                </Button>
                                            </>
                                        )}

                                        {/* 3) ACEITO e data passada e NÃO avaliado → botão Avaliar Serviço */}
                                        {ag.statusAgendamento === "ACEITO" && dataPassada && !ag.avaliado && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                sx={{ mt: 2 }}
                                                onClick={() => abrirAvaliar(ag.idAgendamento)}
                                            >
                                                Avaliar Serviço
                                            </Button>
                                        )}
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>

            {/* Dialog de Avaliação */}
            <Dialog open={avaliarOpen} onClose={() => setAvaliarOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Avaliar Serviço</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <Rating
                            value={avaliarNota}
                            onChange={(_, newValue) => setAvaliarNota(newValue)}
                            precision={0.5}
                        />
                        <TextField
                            label="Como foi o atendimento?"
                            multiline
                            rows={4}
                            value={avaliarDescricao}
                            onChange={(e) => setAvaliarDescricao(e.target.value)}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAvaliarOpen(false)}>Fechar</Button>
                    <Button onClick={salvar} variant="contained">
                        Salvar Avaliação
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
