import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  Container,
  Card,
  CircularProgress,
  TextField,
  InputAdornment,
  InputLabel,
  Avatar,
  Typography,
  IconButton,
  DialogContent,
  DialogActions,
  Dialog,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import BuscaPrestadores from "../components/cliente/BuscaPrestadores";
import { CategoriaDTO, listarCategorias } from "../services/categoriaService";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "@mui/material/styles";
import {
  atualizarCliente,
  atualizarFotoCliente,
  ClienteDTO,
} from "../services/clienteService";
import HeaderCliente from "../components/cliente/HeaderCliente";
import TrocarTema from "../components/TrocarTema";

export default function PageProcurarServico() {
  const theme = useTheme();
  const [busca, setBusca] = useState("");

  const { user, setUser } = useUser();
  const [openFiltros, setOpenFiltros] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<number[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<ClienteDTO>>({});
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  useEffect(() => {
    if (user?.cep) {
      const cepLimpo = user.cep.replace(/\D/g, "");
      if (cepLimpo.length === 8) {
        fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
          .then((resp) => resp.json())
          .then((data) => {
            if (!data.erro) {
              setCidade(data.localidade);
              setEstado(data.uf);
            }
          })
          .catch((err) => console.error("Erro ao buscar CEP:", err));
      }
    }
  }, [user?.cep]);

  useEffect(() => {
    if (openFiltros) {
      listarCategorias().then(setCategorias).catch(console.error);
    }
  }, [openFiltros]);

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

  const limparFiltros = () => setCategoriasSelecionadas([]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.paper }}>
      {/*Usa a HeaderCliente unificada */}
      <HeaderCliente
        onEditarPerfil={() => {
          if (user) {
            setFormData(user); 
          }
          setOpenDialog(true);
        }}
        onLogout={() => setUser(null)}
      />


      <Container sx={{ mt: 5 }}>
        <Card
          sx={{
            backgroundColor: theme.palette.background.default,
            boxShadow: 4,
            borderRadius: 3,
            p: 3,
          }}
        >
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Buscar serviços..."
              variant="outlined"
              size="small"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              sx={{
                flex: 1,
                backgroundColor: theme.palette.background.default,
                borderRadius: 2,
                input: { color: theme.palette.text.primary },
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
                backgroundColor: "primary.main",
                color: "secondary.main",
                "&:hover": { backgroundColor: "#2e3e75" },
              }}
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
              <Button size="small" onClick={limparFiltros}>
                Limpar
              </Button>
            </Stack>
          )}

          {/*Busca prestadores já filtrando por cidade/estado */}
          <BuscaPrestadores
            busca={busca}
            categorias={categoriasSelecionadas}
            cidade={cidade}
            estado={estado}
          />
        </Card>
      </Container>

      {/*Dialog de filtros */}
      <Dialog
        open={openFiltros}
        onClose={() => setOpenFiltros(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 2,
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <Box>
          {/* Cabeçalho */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
              Filtros
            </Typography>
            <IconButton onClick={() => setOpenFiltros(false)} color="primary">
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* Conteúdo */}
          <DialogContent dividers sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Categorias
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                boxShadow: 1,
              }}
            >
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={1.5}
                useFlexGap
              >
                {categorias.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.nome}
                    clickable
                    onClick={() => toggleCategoria(cat.id)}
                    color={
                      categoriasSelecionadas.includes(cat.id)
                        ? "primary"
                        : "default"
                    }
                    variant={
                      categoriasSelecionadas.includes(cat.id)
                        ? "filled"
                        : "outlined"
                    }
                    sx={{
                      fontWeight: categoriasSelecionadas.includes(cat.id)
                        ? 600
                        : 400,
                      borderRadius: "16px",
                      px: 1.5,
                      py: 0.5,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </DialogContent>

          {/* Ações */}
          <DialogActions sx={{ mt: 1 }}>
            <Button onClick={limparFiltros} variant="outlined" color="secondary">
              Limpar
            </Button>
            <Button
              onClick={() => setOpenFiltros(false)}
              variant="contained"
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              Aplicar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/*Dialog de editar perfil */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setFormData({});
          setFotoFile(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogContent>
          <Stack spacing={2} mt={1} alignItems="center">
            {/* Foto de perfil centralizada */}
            <Avatar
              src={
                fotoFile
                  ? URL.createObjectURL(fotoFile)
                  : user?.foto
                    ? `data:image/jpeg;base64,${user.foto}`
                    : undefined
              }
              alt={formData.nome || "Foto"}
              sx={{ width: 120, height: 120, mb: 2 }}
            />

            <Button variant="outlined" component="label">
              {fotoFile ? "Foto selecionada" : "Alterar Foto"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  setFotoFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </Button>

            <TextField
              label="Nome"
              name="nome"
              value={formData.nome || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nome: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="E-mail"
              name="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Telefone"
              name="telefone"
              value={formData.telefone || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, telefone: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Cidade"
              name="cidade"
              value={formData.cidade || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cidade: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Estado"
              name="estado"
              value={formData.estado || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, estado: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Senha"
              name="senha"
              type="password"
              value={formData.senha || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, senha: e.target.value }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setFormData({});
              setFotoFile(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (!user) return;
              try {
                setLoading(true);
                let updated = user;

                if (Object.keys(formData).length > 0) {
                  updated = await atualizarCliente(user.id, formData);
                }

                if (fotoFile) {
                  updated = await atualizarFotoCliente(user.id, fotoFile);
                }

                setUser(updated);
                setOpenDialog(false);
                setFormData({});
                setFotoFile(null);
              } catch (err) {
                console.error("Erro ao atualizar perfil", err);
                alert("Erro ao atualizar perfil");
              } finally {
                setLoading(false);
              }
            }}
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
