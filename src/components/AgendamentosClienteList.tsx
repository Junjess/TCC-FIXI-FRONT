// src/components/AgendamentosClienteList.tsx
import { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import { cancelarAgendamento, listarAgendamentosPorCliente } from "../services/agendamentoService";
import { useUser } from "../contexts/UserContext";

type Props = {
    clienteId: number;
};

export type AgendamentoRespostaDTO = {
    idAgendamento: number;
    idPrestador: number;
    nomePrestador: string;
    telefonePrestador: string;
    fotoPrestador: string | null; // URL da foto (ou null/vazio)
    cidadePrestador: string | null;
    estadoPrestador: string | null;
    categoriaPrestador: string | null;
    data: string; // LocalDate do back vem como "YYYY-MM-DD"
    periodo: string;
}

export default function AgendamentosClienteList({ clienteId }: Props) {
    const [itens, setItens] = useState<AgendamentoRespostaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const {user} = useUser();
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setErro(null);

        listarAgendamentosPorCliente(clienteId)
            .then((res) => {
                if (isMounted) setItens(res);
            })
            .catch((e) => {
                if (isMounted) setErro(e?.response?.data?.message ?? "Falha ao carregar agendamentos.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [clienteId]);

    async function handleCancelar(idAgendamento: number) {
        if(!user) return;
        try {
            await cancelarAgendamento(idAgendamento, user?.id);
            setItens((prev) => prev.filter((a) => a.idAgendamento !== idAgendamento));
        } catch (e) {
            console.error("Erro ao cancelar agendamento:", e);
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
        <Stack spacing={2} sx={{ p: 2 }}>
            {itens.map((ag, idx) => (
                <Card key={`${ag.idPrestador}-${ag.data}-${idx}`} variant="outlined" sx={{ overflow: "hidden" }}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                src={ag.fotoPrestador ?? undefined}
                                alt={ag.nomePrestador}
                                sx={{ width: 56, height: 56 }}
                            >
                                {ag.nomePrestador?.[0] ?? "?"}
                            </Avatar>

                            <Box flex={1}>
                                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                    <Typography variant="h6">{ag.nomePrestador}</Typography>
                                    {ag.categoriaPrestador && (
                                        <Chip size="small" label={ag.categoriaPrestador} />
                                    )}
                                </Stack>

                                <Typography variant="body2" color="text.secondary">
                                    {ag.cidadePrestador ?? "-"}{ag.estadoPrestador ? `, ${ag.estadoPrestador}` : ""}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    {ag.telefonePrestador ?? "-"}
                                </Typography>
                            </Box>

                            <Divider orientation="vertical" flexItem />

                            <Box minWidth={160} textAlign="right">
                                <Typography variant="subtitle2" color="text.secondary">
                                    Data
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {new Date(ag.data).toLocaleDateString("pt-BR")}
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {ag.periodo}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    sx={{ mt: 1 }}
                                    onClick={() => handleCancelar(ag.idAgendamento)}
                                >
                                    Cancelar
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
}
