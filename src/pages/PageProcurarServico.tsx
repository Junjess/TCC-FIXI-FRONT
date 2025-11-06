// pages/PageProcurarServico.tsx (trechos principais)
import React, { useState, useEffect } from "react";
import {
  Box, Button, Chip, Stack, Container, Card, CircularProgress, TextField,
  InputAdornment, InputLabel, Avatar, Typography, IconButton,
  DialogContent, DialogActions, Dialog, Autocomplete
} from "@mui/material"; // <— Autocomplete aqui
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import BuscaPrestadores from "../components/cliente/BuscaPrestadores";
import { CategoriaDTO, listarCategorias } from "../services/categoriaService";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "@mui/material/styles";
import HeaderCliente from "../components/cliente/HeaderCliente";
import TrocarTema from "../components/TrocarTema";
import { useNavigate } from "react-router-dom";
import { UFS, listarCidadesPorUF } from "../services/ibgeService"; // <— NOVO

export default function PageProcurarServico() {
  const theme = useTheme();
  const [busca, setBusca] = useState("");
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [openFiltros, setOpenFiltros] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<number[]>([]);

  // NOVO: estado de filtros de localização
  const [ufSel, setUfSel] = useState<string | null>(null);
  const [cidadesOpcoes, setCidadesOpcoes] = useState<string[]>([]);
  const [cidadesSel, setCidadesSel] = useState<string[]>([]);

  // Tick para disparar busca no filho somente ao clicar “Aplicar”
  const [aplicarTick, setAplicarTick] = useState(0);

  useEffect(() => {
    if (openFiltros) listarCategorias().then(setCategorias).catch(console.error);
  }, [openFiltros]);

  useEffect(() => {
    // quando muda UF, carrega as cidades via IBGE e limpa seleção anterior
    (async () => {
      if (!ufSel) { setCidadesOpcoes([]); setCidadesSel([]); return; }
      const lista = await listarCidadesPorUF(ufSel);
      setCidadesOpcoes(lista);
      setCidadesSel([]); // limpa
    })();
  }, [ufSel]);

  const toggleCategoria = (id: number) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const limparFiltros = () => {
    setCategoriasSelecionadas([]);
    setUfSel(null);
    setCidadesOpcoes([]);
    setCidadesSel([]);
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.paper }}>
      <HeaderCliente
        onEditarPerfil={() => {/* ...mantém igual... */}}
        onLogout={() => { setUser(null); navigate("/main"); }}
      />

      <Container sx={{ mt: 5 }}>
        <Card sx={{ backgroundColor: theme.palette.background.default, boxShadow: 4, borderRadius: 3, p: 3 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Buscar serviços..."
              variant="outlined"
              size="small"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              sx={{ flex: 1, backgroundColor: theme.palette.background.default, borderRadius: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={() => setOpenFiltros(true)}
              sx={{ fontWeight: "bold" }}
            >
              Filtros
            </Button>
          </Stack>

          {/* Chips de categorias ativas (opcional) */}
          {categoriasSelecionadas.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ p: 2, flexWrap: "wrap" }}>
              <InputLabel sx={{ alignSelf: "center" }}>Categorias:</InputLabel>
              {categorias
                .filter((c) => categoriasSelecionadas.includes(c.id))
                .map((c) => (
                  <Chip
                    key={c.id}
                    label={c.nome}
                    onDelete={() => toggleCategoria(c.id)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              <Button size="small" onClick={limparFiltros}>Limpar</Button>
            </Stack>
          )}

          {/* Busca — agora só roda quando aplicarTick muda */}
          <BuscaPrestadores
            busca={busca}
            categorias={categoriasSelecionadas}
            aplicarTick={aplicarTick}
            uf={ufSel}
            cidades={cidadesSel}
          />
        </Card>
      </Container>

      {/* Dialog de filtros */}
      <Dialog open={openFiltros} onClose={() => setOpenFiltros(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "16px", p: 2, backgroundColor: theme.palette.background.default } }}>
        {/* Cabeçalho */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">Filtros</Typography>
          <IconButton onClick={() => setOpenFiltros(false)} color="primary"><CloseIcon /></IconButton>
        </Stack>

        {/* Conteúdo */}
        <DialogContent dividers sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 500 }}>Categorias</Typography>
          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper, boxShadow: 1, mb: 3 }}>
            <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap>
              {categorias.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.nome}
                  clickable
                  onClick={() => toggleCategoria(cat.id)}
                  color={categoriasSelecionadas.includes(cat.id) ? "primary" : "default"}
                  variant={categoriasSelecionadas.includes(cat.id) ? "filled" : "outlined"}
                />
              ))}
            </Stack>
          </Box>

          {/* NOVO: Localização */}
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 500 }}>Localização</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Autocomplete
              options={UFS as unknown as string[]}
              value={ufSel}
              onChange={(_, v) => setUfSel(v)}
              renderInput={(params) => <TextField {...params} label="UF" size="small" />}
              sx={{ width: 140 }}
            />
            <Autocomplete
              multiple
              disabled={!ufSel}
              options={cidadesOpcoes}
              value={cidadesSel}
              onChange={(_, v) => setCidadesSel(v)}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField {...params} label="Cidades" size="small" placeholder={ufSel ? "Selecione..." : "Escolha a UF"} />
              )}
              sx={{ flex: 1, minWidth: 280 }}
            />
          </Stack>
        </DialogContent>

        {/* Ações */}
        <DialogActions sx={{ mt: 1 }}>
          <Button onClick={limparFiltros} variant="outlined" color="secondary">Limpar</Button>
          <Button
            onClick={() => { setOpenFiltros(false); setAplicarTick((t) => t + 1); }}
            variant="contained" color="primary" sx={{ fontWeight: "bold" }}
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>

      <TrocarTema />
    </Box>
  );
}
