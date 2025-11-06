import React, { useState, useEffect } from "react";
import {
  Box, Button, Chip, Stack, Container, Card, CircularProgress, TextField,
  InputAdornment, InputLabel, Avatar, Typography, IconButton,
  DialogContent, DialogActions, Dialog, DialogTitle, Autocomplete
} from "@mui/material";
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
import { UFS, listarCidadesPorUF } from "../services/ibgeService";
import { ClienteDTO, atualizarCliente, atualizarFotoCliente } from "../services/clienteService";

export default function PageProcurarServico() {
  const theme = useTheme();
  const [busca, setBusca] = useState("");
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [openFiltros, setOpenFiltros] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<number[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<ClienteDTO>>({});
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viaCepLoading, setViaCepLoading] = useState(false);
  const [viaCepError, setViaCepError] = useState<string | null>(null);

  const [ufSel, setUfSel] = useState<string | null>(null);
  const [cidadesOpcoes, setCidadesOpcoes] = useState<string[]>([]);
  const [cidadesSel, setCidadesSel] = useState<string[]>([]);

  const [aplicarTick, setAplicarTick] = useState(0);

  useEffect(() => {
    if (openFiltros) listarCategorias().then(setCategorias).catch(console.error);
  }, [openFiltros]);

  useEffect(() => {
    (async () => {
      if (!ufSel) { setCidadesOpcoes([]); setCidadesSel([]); return; }
      const lista = await listarCidadesPorUF(ufSel);
      setCidadesOpcoes(lista);
      setCidadesSel([]);
    })();
  }, [ufSel]);

  if (!user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const toggleCategoria = (id: number) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleOpenDialog = () => {
    setFormData({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      cep: user.cep,
      cidade: user.cidade,
      estado: user.estado,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
    setFotoFile(null);
    setPreviewFoto(null);
    setViaCepError(null);
    setViaCepLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

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

  const handleSave = async () => {
    try {
      setLoading(true);

      if (Object.keys(formData).length > 0) {
        const updated = await atualizarCliente(user.id, formData);
        setUser(updated);
      }

      if (fotoFile) {
        const updated = await atualizarFotoCliente(user.id, fotoFile);
        setUser(updated);
      }

      handleCloseDialog();
    } catch (err) {
      console.error("Erro ao atualizar cliente", err);
      alert("Erro ao atualizar cliente");
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setCategoriasSelecionadas([]);
    setUfSel(null);
    setCidadesOpcoes([]);
    setCidadesSel([]);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.paper }}>
      <HeaderCliente
        onEditarPerfil={handleOpenDialog}
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">Filtros</Typography>
          <IconButton onClick={() => setOpenFiltros(false)} color="primary"><CloseIcon /></IconButton>
        </Stack>

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

      {/* === Dialog de EDIÇÃO DE PERFIL (replicado do HomeCliente) === */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
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
              <input type="file" hidden accept="image/*" onChange={handleFotoChange} />
            </Button>

            <TextField
              label="Nome"
              name="nome"
              value={formData.nome || ""}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="E-mail"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Telefone"
              name="telefone"
              value={formData.telefone || ""}
              onChange={handleChange}
              fullWidth
            />

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

            <TextField
              label="Cidade"
              name="cidade"
              value={formData.cidade || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Estado"
              name="estado"
              value={formData.estado || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />

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
          <Button onClick={handleCloseDialog}>Cancelar</Button>
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
}
