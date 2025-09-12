import React, { useState, useEffect } from "react";
import {
  AppBar, Toolbar, TextField, InputAdornment, Button, IconButton, Box, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormGroup, FormControlLabel, Checkbox, InputLabel, Chip, Stack
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SmartToy from "@mui/icons-material/SmartToy";
import AccountCircle from "@mui/icons-material/AccountCircle";
import History from "@mui/icons-material/History";
import BuscaPrestadores from "../components/BuscaPrestadores";
import { CategoriaDTO, listarCategorias } from "../services/categoriaService";

export default function PageProcurarServico() {
  const theme = useTheme();
  const [busca, setBusca] = useState("");

  const [openFiltros, setOpenFiltros] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<number[]>([]);

  useEffect(() => {
    if (openFiltros) {
      listarCategorias().then(setCategorias).catch(console.error);
    }
  }, [openFiltros]);

  const toggleCategoria = (id: number) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const limparFiltros = () => setCategoriasSelecionadas([]);

  return (
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

          <TextField
            placeholder="Buscar serviços..."
            variant="outlined"
            size="small"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            sx={{
              mx: 4,
              flex: 1,
              backgroundColor: theme.palette.background.default,
              borderRadius: 2,
              input: { color: "#000" },
            }}
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
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={() => setOpenFiltros(true)}
            sx={{
              fontWeight: "bold",
              mr: 4,
              backgroundColor: "primary.main",
              color: "secondary.main",
              "&:hover": { backgroundColor: "#2e3e75" },
            }}
          >
            Filtros
          </Button>

          <Box sx={{ display: "flex", alignItems: "center" }}>
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
              sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
            >
              Histórico
            </Button>

            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

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

      <BuscaPrestadores busca={busca} categorias={categoriasSelecionadas} />

      <Dialog
        open={openFiltros}
        onClose={() => setOpenFiltros(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Filtrar por categoria</DialogTitle>
        <DialogContent dividers>
          <FormGroup>
            {categorias.map((cat) => (
              <FormControlLabel
                key={cat.id}
                control={
                  <Checkbox
                    checked={categoriasSelecionadas.includes(cat.id)}
                    onChange={() => toggleCategoria(cat.id)}
                  />
                }
                label={cat.nome}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={limparFiltros}>Limpar</Button>
          <Button
            variant="contained"
            onClick={() => setOpenFiltros(false)}
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
