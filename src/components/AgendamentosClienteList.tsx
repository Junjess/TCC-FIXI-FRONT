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
    statusAgendamento: string;
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
            <Card
                key={`${ag.idPrestador}-${ag.data}-${idx}`}
                sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    overflow: "hidden",
                    transition: "0.3s",
                    "&:hover": { boxShadow: 6 }
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

                        <Box minWidth={180} textAlign="right">
                            <Typography variant="subtitle2" color="text.secondary">
                                Data
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                                {new Date(ag.data).toLocaleDateString("pt-BR")}
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                                {ag.periodo}
                            </Typography>

                            <Chip
                                label={ag.statusAgendamento}
                                color={
                                    ag.statusAgendamento === "ACEITO"
                                        ? "success"
                                        : ag.statusAgendamento === "PENDENTE"
                                        ? "warning"
                                        : "default"
                                }
                                size="small"
                                sx={{ mt: 1 }}
                            />

                            <Button
                                variant="text"
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
