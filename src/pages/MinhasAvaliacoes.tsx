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
import { api } from "../services/api";

function MinhasAvaliacoes() {
  const { user, setUser } = useUser();
  const [prestador, setPrestador] = useState<PrestadorDetalhesDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notaPlataforma, setNotaPlataforma] = useState<number | null>(null);

  interface LinhaResumo {
    periodo: string;
    notaIA: string;
    mediaClientes: string;
  }

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const resp = await buscarPrestadorPorId(user.id);
        setPrestador(resp);

        // Busca nota da plataforma
        const plataforma = await buscarAvaliacoesPlataforma(user.id);
        if (plataforma && plataforma.length > 0) {
          const ultima = plataforma[plataforma.length - 1];
          setNotaPlataforma(ultima.notaFinal);
        }
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

      const response = await api.get(`/avaliacoes/${user.id}/download`, {
        responseType: "blob", // necessário para arquivos binários (PDF)
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "avaliacoes-clientes.pdf";
      document.body.appendChild(a);
      a.click();

      // Limpeza
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
        "Erro ao baixar avaliações. Tente novamente."
      );
    }
  };

  const handleDownloadNotaPlataforma = async () => {
    try {
      if (!user?.id) {
        alert("Usuário não encontrado");
        return;
      }

      const dados = await buscarAvaliacoesPlataforma(user.id);

      console.table(dados);

      // cria container oculto
      const container = document.createElement("div");
      container.style.width = "800px";
      container.style.height = "400px";
      container.style.position = "absolute";
      container.style.top = "-9999px";
      document.body.appendChild(container);

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

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const canvas = await html2canvas(container);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape");
      const hoje = new Date().toLocaleDateString("pt-BR");

      pdf.setFontSize(18);
      pdf.text("Relatório - Nota da Plataforma", 15, 15);

      pdf.setFontSize(12);
      pdf.text(`Gerado em: ${hoje}`, 15, 25);
      pdf.text(`Prestador: ${user?.nome}`, 15, 32);

      pdf.setFontSize(11);
      pdf.text(
        "Este relatório mostra a evolução da sua nota calculada pela plataforma.\n" +
        "O gráfico apresenta indicadores como tempo ativo, taxa de aceitação, taxa de cancelamento,\n" +
        "avaliação da IA e a nota final consolidada.",
        15,
        45,
        { maxWidth: 260 }
      );

      pdf.addImage(imgData, "PNG", 15, 70, 260, 120);

      pdf.text(
        "Conclusão: A Nota Final representa um índice consolidado do seu desempenho geral\nna plataforma, considerando eficiência, confiabilidade e satisfação.",
        15,
        200,
        { maxWidth: 260 }
      );

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
      const normMes = (s: string | undefined | null) => {
        const base = String(s ?? "");
        const m = base.slice(0, 7);
        if (/^\d{4}-\d{2}$/.test(m)) return m;
        const d = new Date(base);
        return isNaN(d.getTime()) ? m : d.toISOString().slice(0, 7);
      };
      const dados = await buscarDesempenhoGeral(user.id);
      const iaRaw = Array.isArray(dados?.avaliacoesPlataforma) ? dados.avaliacoesPlataforma : [];
      const clientesRaw = Array.isArray(dados?.avaliacoesClientes) ? dados.avaliacoesClientes : [];

      const clientesPorMes: Record<string, number[]> = {};
      clientesRaw.forEach((av: { data?: string; nota?: number }) => {
        const mes = normMes(av?.data);
        if (!clientesPorMes[mes]) clientesPorMes[mes] = [];
        if (typeof av?.nota === "number" && !Number.isNaN(av.nota)) {
          clientesPorMes[mes].push(av.nota);
        }
      });

      const mediaClientesPorMes: Record<string, number | null> = {};
      Object.entries(clientesPorMes).forEach(([mes, notas]) => {
        mediaClientesPorMes[mes] = notas.length
          ? notas.reduce((a, b) => a + b, 0) / notas.length
          : null;
      });

      const iaPorMes: Record<string, { notaFinal: number | null }> = {};
      iaRaw.forEach((ia: any) => {
        const mes = normMes(ia?.periodoReferencia);
        const nota = ia?.notaFinal;
        iaPorMes[mes] = {
          notaFinal: typeof nota === "number" && !Number.isNaN(nota) ? nota : null,
        };
      });

      const meses = Array.from(new Set([...Object.keys(mediaClientesPorMes), ...Object.keys(iaPorMes)])).sort();

      const dadosMerged = meses.map((mes) => ({
        periodoReferencia: mes, // "YYYY-MM"
        notaFinal: iaPorMes[mes]?.notaFinal ?? null,
        mediaClientes: mediaClientesPorMes[mes] ?? null,
      }));

      const tabelaResumo: LinhaResumo[] = dadosMerged.map((l) => ({
        periodo: l.periodoReferencia,
        notaIA: l.notaFinal != null ? l.notaFinal.toFixed(2) : "-",
        mediaClientes: l.mediaClientes != null ? l.mediaClientes.toFixed(2) : "-",
      }));

      const container = document.createElement("div");
      container.style.width = "800px";
      container.style.height = "400px";
      container.style.position = "absolute";
      container.style.top = "-9999px";
      document.body.appendChild(container);

      const grafico = (
        <ResponsiveContainer width={800} height={400}>
          <LineChart data={dadosMerged}>
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
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="mediaClientes"
              stroke="#82ca9d"
              strokeWidth={3}
              name="Média dos Clientes"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      );

      const root = createRoot(container);
      root.render(grafico);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const canvas = await html2canvas(container);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape");
      const hoje = new Date().toLocaleDateString("pt-BR");

      pdf.setFontSize(18);
      pdf.text("Relatório - Desempenho Geral", 15, 15);

      pdf.setFontSize(12);
      pdf.text(`Gerado em: ${hoje}`, 15, 25);
      pdf.text(`Prestador: ${user?.nome ?? "-"}`, 15, 32);

      pdf.setFontSize(11);
      pdf.text(
        "Este relatório compara a Nota Final atribuída pela IA com a média das notas recebidas\n" +
        "dos clientes ao longo do tempo. O objetivo é mostrar convergências ou diferenças\n" +
        "entre a avaliação automática da plataforma e a percepção real dos clientes.",
        15,
        45,
        { maxWidth: 260 }
      );

      pdf.addImage(imgData, "PNG", 15, 70, 260, 120);

      (autoTable as any)(pdf, {
        startY: 200,
        head: [["Período", "Nota Final (IA)", "Média Clientes"]],
        body: tabelaResumo.map((linha) => [linha.periodo, linha.notaIA, linha.mediaClientes]),
      });

      const yAfterTable = (pdf as any).lastAutoTable.finalY + 10;
      pdf.text(
        "Legenda: Nota Final (IA) → avaliação automática da plataforma.\nMédia Clientes → percepção dos clientes reais em cada período.",
        15,
        yAfterTable
      );

      const ultimaNotaIAstr = tabelaResumo[tabelaResumo.length - 1]?.notaIA ?? "-";
      const ultimaNotaIANum = parseFloat(ultimaNotaIAstr);
      const msgConclusao =
        !Number.isNaN(ultimaNotaIANum) && ultimaNotaIAstr !== "-"
          ? `${ultimaNotaIANum >= 4 ? "indicando bom desempenho" : "mostrando que há pontos a melhorar"}`
          : "sem dado disponível para conclusão";
      pdf.text(`Conclusão: Sua última nota da IA foi ${ultimaNotaIAstr}, ${msgConclusao}.`, 15, yAfterTable + 20);

      pdf.save("desempenho-geral.pdf");
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
          <Box flex={1} display="flex" flexDirection="column">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Minhas Avaliações
            </Typography>
            <Box mt={2}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 4,
                  bgcolor: "background.paper",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-around"
                  alignItems="center"
                  spacing={4}
                >
                  <Box textAlign="center" flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      Média Geral (Clientes)
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
                  <Box textAlign="center" flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      Nota da Plataforma
                    </Typography>
                    <Rating
                      value={notaPlataforma || 0}
                      precision={0.5}
                      readOnly
                      size="large"
                    />
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {notaPlataforma
                        ? `${notaPlataforma.toFixed(1)} estrelas`
                        : "Sem nota disponível"}
                    </Typography>
                  </Box>
                </Stack>
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
                      backgroundColor: "background.paper",
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
          <Box
            sx={{
              width: { xs: "100%", md: "320px" },
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              mt: 5
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
              📊 Relatórios
            </Typography>

            <Card
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: 4,
                backgroundColor: "background.paper",
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
