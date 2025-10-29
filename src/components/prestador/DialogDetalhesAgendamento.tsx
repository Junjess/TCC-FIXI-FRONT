import React from "react";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { AgendamentoRespostaDTO } from "../../services/agendamentoService";

type Props = {
    open: boolean;
    agendamento: AgendamentoRespostaDTO | null;
    onClose: () => void;
    formatarTelefone: (telefone: string | null) => string;
};

const DialogDetalhesAgendamento: React.FC<Props> = ({
    open,
    agendamento,
    onClose,
    formatarTelefone,
}) => {
    if (!agendamento) return null;


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>📋 Detalhes do Agendamento</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {/* Dados do cliente */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            src={agendamento.fotoCliente ?? undefined}
                            alt={agendamento.nomeCliente}
                            sx={{ width: 64, height: 64 }}
                        >
                            {agendamento.nomeCliente?.[0] ?? "?"}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                {agendamento.nomeCliente}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                📞 {formatarTelefone(agendamento.telefoneCliente)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                📍 {agendamento.cidadeCliente}, {agendamento.estadoCliente}
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider />

                    {/* Dados do agendamento */}
                    <Typography variant="body1">
                        <strong>Categoria:</strong> {agendamento.categoriaAgendamento}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Data:</strong>{" "}
                        {dayjs(agendamento.data).format("DD/MM/YYYY")} —{" "}
                        {agendamento.periodo}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Status:</strong> {agendamento.statusAgendamento}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Descrição do serviço:</strong>{" "}
                        {agendamento.descricaoServico}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Valor proposto a pagar:</strong>{" "}
                        {agendamento.valorSugerido
                            ? `R$ ${agendamento.valorSugerido.toFixed(2)}`
                            : "Não informado"}
                    </Typography>

                    {agendamento.canceladoPor && (
                        <Typography variant="body1" color="error">
                            Cancelado por: {agendamento.canceladoPor}
                        </Typography>
                    )}

                    {agendamento.avaliado && (
                        <Box>
                            <Typography variant="body1">
                                <strong>Avaliação:</strong> {agendamento.notaAvaliacaoPrestador}/5
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {agendamento.comentarioAvaliacaoPrestador}
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogDetalhesAgendamento;
