import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Box,
  useTheme,
  InputLabel,
  Chip,
  Stack,
  Container,
  Card,
  CircularProgress,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SmartToy from "@mui/icons-material/SmartToy";
import AccountCircle from "@mui/icons-material/AccountCircle";
import History from "@mui/icons-material/History";
import BuscaPrestadores from "../components/BuscaPrestadores";
import { CategoriaDTO, listarCategorias } from "../services/categoriaService";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Home, Search } from "@mui/icons-material";
import {
  atualizarCliente,
  atualizarFotoCliente,
  ClienteDTO,
} from "../services/clienteService";

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
  const [loading, setLoading] = useState(false);

  // 🔹 estados para cidade/estado obtidos pelo CEP
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // 🔹 busca cidade/estado a partir do CEP do usuário
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

  const handleOpenDialog = () => {
    setFormData({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      cidade: user.cidade,
      estado: user.estado,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFotoFile(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

          <Box sx={{ ml: "auto" }}>
            <Button
              color="inherit"
              startIcon={<Home />}
              sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
              onClick={() => navigate("/home/cliente")}
            >
              Início
            </Button>
            <Button
              color="inherit"
              startIcon={<Search />}
              sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
              onClick={() => navigate("/search")}
            >
              Procurar Serviço
            </Button>
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
              onClick={() => navigate("/historico/cliente")}
              sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
            >
              Histórico
            </Button>
          </Box>

          {/* Perfil */}
          <IconButton color="inherit" onClick={handleOpenDialog}>
            {user.foto ? (
              <Avatar
                src={`data:image/jpeg;base64,${user.foto}`}
                alt={user.nome}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 5 }}>
        <Card
          sx={{
            backgroundColor: theme.palette.background.default,
            boxShadow: 4,
            borderRadius: 3,
            p: 3,
          }}
        >
          <TextField
            placeholder="Buscar serviços..."
            variant="outlined"
            size="small"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            sx={{
              flex: 1,
              mr: 2,
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

          {/* 🔹 Busca prestadores já filtrando por cidade/estado */}
          <BuscaPrestadores
            busca={busca}
            categorias={categoriasSelecionadas}
            cidade={cidade}
            estado={estado}
          />
        </Card>
      </Container>

      {/* Dialogs de filtro e editar perfil permanecem iguais */}
      ...
    </Box>
  );
}
