import React, { useState } from "react";
import {
  Typography,
  Box,
  Container,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  useTheme,
  CircularProgress,
  Button,
  Avatar,
} from "@mui/material";
import { CalendarMonth } from "@mui/icons-material";
import TrocarTema from "../components/TrocarTema";
import { useUser } from "../contexts/UserContext";
import AgendamentosClienteList from "../components/cliente/AgendamentosClienteList";
import { useNavigate } from "react-router-dom";
import {
  atualizarCliente,
  atualizarFotoCliente,
  ClienteDTO,
} from "../services/clienteService";
import HeaderCliente from "../components/cliente/HeaderCliente";

const HomeCliente: React.FC = () => {
  const theme = useTheme();
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<ClienteDTO>>({});
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const [viaCepLoading, setViaCepLoading] = useState(false);
  const [viaCepError, setViaCepError] = useState<string | null>(null);

  if (!user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Consulta ViaCEP
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

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.paper }}
    >
      {/* HEADER */}
      <HeaderCliente
        onEditarPerfil={handleOpenDialog}
        onLogout={() => {
          setUser(null);
          navigate("/main");
        }}
      />

      {/* CONTEÚDO */}
      <Container sx={{ mt: 5 }}>
        <Typography
          variant="h5"
          sx={{ mb: 4, fontWeight: "bold", color: "primary.main" }}
        >
          👋 Bem-vindo(a), {user.nome}!
        </Typography>

        <Card
          sx={{
            backgroundColor: theme.palette.background.default,
            boxShadow: 4,
            borderRadius: 3,
            p: 3,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            <CalendarMonth sx={{ mr: 1, verticalAlign: "middle" }} />
            Meus Agendamentos
          </Typography>

          <AgendamentosClienteList clienteId={user.id} />
        </Card>
      </Container>

      {/* Dialog de edição */}
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
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFotoChange}
              />
            </Button>

            {/* Nome */}
            <TextField
              label="Nome"
              name="nome"
              value={formData.nome || ""}
              onChange={handleChange}
              fullWidth
            />

            {/* Email */}
            <TextField
              label="E-mail"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              fullWidth
            />

            {/* Telefone */}
            <TextField
              label="Telefone"
              name="telefone"
              value={formData.telefone || ""}
              onChange={handleChange}
              fullWidth
            />

            {/* CEP */}
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

            {/* Cidade (readOnly) */}
            <TextField
              label="Cidade"
              name="cidade"
              value={formData.cidade || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            {/* Estado (readOnly) */}
            <TextField
              label="Estado"
              name="estado"
              value={formData.estado || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            {/* Senha */}
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
};

export default HomeCliente;
