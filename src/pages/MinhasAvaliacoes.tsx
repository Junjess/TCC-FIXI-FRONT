import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Rating,
  CircularProgress,
  Divider,
  Paper,
  Button,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useUser } from "../contexts/UserContext";
import {
  buscarPrestadorPorId,
  PrestadorDetalhesDTO,
  PrestadorProfileDTO,
  atualizarPrestador,
  atualizarFotoPrestador,
} from "../services/prestadorService";
import TrocarTema from "../components/TrocarTema";
import HeaderPrestador from "../components/prestador/HeaderPrestador";
import DialogEditarPrestador from "../components/prestador/DialogEditarPrestador";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { buscarAvaliacoesPlataforma, buscarDesempenhoGeral } from "../services/avaliacaoService";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createRoot } from "react-dom/client";

function MinhasAvaliacoes() {
  const { user, setUser } = useUser();
  const [prestador, setPrestador] = useState<PrestadorDetalhesDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const resp = await buscarPrestadorPorId(user.id);
        setPrestador(resp);
      } catch (err) {
        console.error("Erro ao carregar avaliações:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleSave = async (
    formData: Partial<PrestadorProfileDTO>,
    fotoFile: File | null
  ) => {
    if (!user?.id) return;
    setSaving(true);
    try {
      let updated = await atualizarPrestador(user.id, formData);

      if (fotoFile) {
        updated = await atualizarFotoPrestador(user.id, fotoFile);
      }

      setUser(updated);

      setPrestador((prev) =>
        prev
          ? { ...prev, ...updated, categorias: prev.categorias }
          : prev
      );
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadAvaliacoes = async () => {
    try {
      if (!user?.id) {
        alert("Usuário não encontrado");
        return;
      }

      const response = await fetch(`http://localhost:8080/avaliacoes/${user.id}/download`, {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error("Erro ao baixar avaliações");
      }
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "avaliacoes-clientes.pdf";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Erro ao baixar avaliações");
    }
  };

  const handleDownloadNotaPlataforma = async () => {
    try {
      if (!user?.id) {
        alert("Usuário não encontrado");
        return;
      }

      const dados = await buscarAvaliacoesPlataforma(user.id);

      // cria container oculto
      const container = document.createElement("div");
      container.style.width = "800px";
      container.style.height = "400px";
      container.style.position = "absolute";
      container.style.top = "-9999px";
      document.body.appendChild(container);

      // monta o gráfico
      const grafico = (
        <ResponsiveContainer width={800} height={400}>
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodoReferencia" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="tempoPlataforma" stroke="#8884d8" name="Tempo na Plataforma" />
            <Line type="monotone" dataKey="taxaAceitacao" stroke="#82ca9d" name="Taxa de Aceitação" />
            <Line type="monotone" dataKey="taxaCancelamento" stroke="#ff7300" name="Taxa de Cancelamento" />
            <Line type="monotone" dataKey="avaliacaoIa" stroke="#00bcd4" name="Avaliação IA" />
            <Line type="monotone" dataKey="notaFinal" stroke="#000" strokeWidth={2} name="Nota Final" />
          </LineChart>
        </ResponsiveContainer>
      );

      const root = createRoot(container);
      root.render(grafico);

      // 🔑 espera o React renderizar
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const canvas = await html2canvas(container);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape");
      pdf.text("Relatório - Nota da Plataforma", 15, 15);
      pdf.addImage(imgData, "PNG", 15, 30, 260, 120);
      pdf.save("nota-plataforma.pdf");

      root.unmount();
      container.remove();
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF da Nota da Plataforma");
    }
  };

const handleDownloadDesempenhoGeral = async () => {
  try {
    if (!user?.id) {
      alert("Usuário não encontrado");
      return;
    }

    // Busca dados no backend
    const dados = await buscarDesempenhoGeral(user.id);

    // IA (já vem pronto do back)
    const dadosIA = dados.avaliacoesPlataforma;

    // Clientes → calcular média mensal
    const clientesPorMes: Record<string, number[]> = {};
    dados.avaliacoesClientes.forEach((av: any) => {
      const mes = av.data?.substring(0, 7) || "2025-09"; // yyyy-MM
      if (!clientesPorMes[mes]) clientesPorMes[mes] = [];
      clientesPorMes[mes].push(av.nota);
    });

    const dadosClientes = Object.entries(clientesPorMes).map(([mes, notas]) => ({
      periodoReferencia: mes + "-01",
      mediaClientes: notas.reduce((a, b) => a + b, 0) / notas.length,
    }));

    // Monta tabela resumo
    const tabelaResumo = dadosIA.map((ia: any) => {
      const clientes = dadosClientes.find(
        (c) => c.periodoReferencia === ia.periodoReferencia
      );
      return {
        periodo: ia.periodoReferencia,
        notaIA: ia.notaFinal.toFixed(2),
        mediaClientes: clientes ? clientes.mediaClientes.toFixed(2) : "-",
      };
    });

    // Cria container oculto para o gráfico
    const container = document.createElement("div");
    container.style.width = "800px";
    container.style.height = "400px";
    container.style.position = "absolute";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    const grafico = (
      <ResponsiveContainer width={800} height={400}>
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodoReferencia" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="notaFinal"
            stroke="#000"
            strokeWidth={3}
            name="Nota Final (IA)"
            data={dadosIA}
          />
          <Line
            type="monotone"
            dataKey="mediaClientes"
            stroke="#82ca9d"
            strokeWidth={3}
            name="Média dos Clientes"
            data={dadosClientes}
          />
        </LineChart>
      </ResponsiveContainer>
    );

    const root = createRoot(container);
    root.render(grafico);

    // espera renderizar
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // captura gráfico como imagem
    const canvas = await html2canvas(container);
    const imgData = canvas.toDataURL("image/png");

    // cria PDF
    const pdf = new jsPDF("landscape");
    pdf.text("Relatório - Desempenho Geral", 15, 15);
    pdf.addImage(imgData, "PNG", 15, 30, 260, 120);

    // adiciona tabela com autoTable
    autoTable(pdf, {
      startY: 160,
      head: [["Período", "Nota Final (IA)", "Média Clientes"]],
      body: tabelaResumo.map(
        (linha: { periodo: string; notaIA: string; mediaClientes: string }) => [
          linha.periodo,
          linha.notaIA,
          linha.mediaClientes,
        ]
      ),
    });

    // 🔹 salva PDF
    pdf.save("desempenho-geral.pdf");

    // 🔹 limpa DOM
    root.unmount();
    container.remove();
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar PDF do Desempenho Geral");
  }
};


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <HeaderPrestador onEditarPerfil={() => setOpenDialog(true)} />

      <Box p={{ xs: 2, md: 4 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          alignItems="stretch"
        >
          {/* ESQUERDA: Avaliações */}
          <Box flex={1} display="flex" flexDirection="column">
            {/* Cabeçalho da seção */}
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Minhas Avaliações
            </Typography>

            {/* Box para empurrar o Paper e alinhar com Relatórios */}
            <Box mt={2}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #f5f7fa, #ffffff)",
                }}
              >
                <Box textAlign="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Média Geral
                  </Typography>
                  <Rating
                    value={prestador?.mediaAvaliacao || 0}
                    precision={0.5}
                    readOnly
                    size="large"
                  />
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {prestador?.mediaAvaliacao
                      ? `${prestador.mediaAvaliacao.toFixed(1)} estrelas`
                      : "Sem avaliações ainda"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {prestador?.avaliacoes?.length || 0} avaliação(ões)
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {!prestador?.avaliacoes || prestador.avaliacoes.length === 0 ? (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: "center", mt: 2 }}
              >
                Você ainda não recebeu nenhuma avaliação.
              </Typography>
            ) : (
              <Stack spacing={3}>
                {prestador.avaliacoes.map((av, index) => (
                  <Card
                    key={index}
                    sx={{
                      borderRadius: 3,
                      boxShadow: 3,
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main", color: "white" }}>
                          {av.clienteNome[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {av.clienteNome}
                          </Typography>
                          <Rating value={av.nota} precision={0.5} readOnly />
                        </Box>
                      </Stack>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {av.descricao || "Sem comentário."}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>

          {/* DIREITA: Relatórios */}
          <Box
            sx={{
              width: { xs: "100%", md: "320px" },
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              mt: 5
            }}
          >
            {/* Cabeçalho fora do Card, igual à esquerda */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
              📊 Relatórios
            </Typography>

            <Card
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: 4,
                background: "linear-gradient(135deg, #f5f7fa, #ffffff)",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack spacing={2} flex={1} justifyContent="center">
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadAvaliacoes}
                >
                  Avaliações dos Clientes
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadNotaPlataforma}
                >
                  Nota da Plataforma
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadDesempenhoGeral}
                >
                  Desempenho Geral
                </Button>
              </Stack>
            </Card>
          </Box>

        </Stack>

        <Box mt={4}>
          <TrocarTema />
        </Box>
      </Box>

      {/* Dialog de Edição */}
      {user && (
        <DialogEditarPrestador
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          user={user as PrestadorProfileDTO}
          onSave={handleSave}
          loading={saving}
        />
      )}
    </>
  );
}

export default MinhasAvaliacoes;
