import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { PrestadorProfileDTO } from "../../services/prestadorService";

const serviceTypes = [
  { id: 1, nome: "Eletricista" },
  { id: 2, nome: "Encanador" },
  { id: 3, nome: "Pedreiro" },
  { id: 4, nome: "Jardineiro" },
  { id: 5, nome: "Cozinheiro Privado" },
  { id: 6, nome: "Babá" },
  { id: 7, nome: "Motorista" },
  { id: 8, nome: "Dog Walker" },
  { id: 9, nome: "Faxineiro" },
  { id: 10, nome: "Professor Particular" },
  { id: 11, nome: "Manicure/Pedicure" },
  { id: 12, nome: "Assistente Virtual" },
  { id: 13, nome: "Fotógrafo" },
  { id: 14, nome: "Consultor de TI" },
];

interface DialogEditarPrestadorProps {
  open: boolean;
  onClose: () => void;
  user: PrestadorProfileDTO;
  onSave: (
    formData: Partial<PrestadorProfileDTO>,
    fotoFile: File | null
  ) => Promise<void>;
  loading: boolean;
}

const DialogEditarPrestador: React.FC<DialogEditarPrestadorProps> = ({
  open,
  onClose,
  user,
  onSave,
  loading,
}) => {
  const [formData, setFormData] = useState<Partial<PrestadorProfileDTO>>({});
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<
    { id: number; nome: string }[]
  >([]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        cep: user.cep,
        cidade: user.cidade,
        estado: user.estado,
      });
      setPreviewFoto(user.foto ? `data:image/jpeg;base64,${user.foto}` : null);

      const selecionadas = serviceTypes.filter((cat) =>
        user.categorias?.some((c) => c.descricao === cat.nome)
      );
      setCategoriasSelecionadas(selecionadas);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buscarCep = async (valor: string) => {
    const cepLimpo = valor.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, cep: valor }));

    if (cepLimpo.length < 8) {
      setFormData((prev) => ({ ...prev, cidade: "", estado: "" }));
      return;
    }

    if (cepLimpo.length === 8) {
      try {
        const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await resp.json();

        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            cidade: data.localidade || "",
            estado: data.uf || "",
          }));
        } else {
          setFormData((prev) => ({ ...prev, cidade: "", estado: "" }));
          setSnackbar({
            open: true,
            message: "CEP não encontrado",
            severity: "warning",
          });
        }
      } catch {
        setFormData((prev) => ({ ...prev, cidade: "", estado: "" }));
        setSnackbar({
          open: true,
          message: "Erro ao buscar CEP",
          severity: "error",
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      await onSave(
        {
          ...formData,
          categorias: categoriasSelecionadas.map((c) => ({
            id: String(c.id),
            descricao: c.nome,
          })),
        },
        fotoFile
      );
      setSnackbar({
        open: true,
        message: "Perfil atualizado com sucesso!",
        severity: "success",
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setSnackbar({
        open: true,
        message: "Erro ao salvar perfil",
        severity: "error",
      });
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFotoFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewFoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
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
              src={previewFoto || undefined}
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
            <TextField
              label="CEP"
              name="cep"
              value={formData.cep || ""}
              onChange={(e) => buscarCep(e.target.value)}
              fullWidth
            />
            <TextField
              label="Cidade"
              name="cidade"
              value={formData.cidade || ""}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Estado"
              name="estado"
              value={formData.estado || ""}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Senha"
              name="senha"
              type="password"
              value={formData.senha || ""}
              onChange={handleChange}
              fullWidth
            />

            {/*Autocomplete para categorias */}
            <Autocomplete
              multiple
              options={serviceTypes}
              value={categoriasSelecionadas}
              onChange={(_, value) => setCategoriasSelecionadas(value)}
              getOptionLabel={(option) => option.nome}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categorias"
                  placeholder="Selecione categorias"
                />
              )}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DialogEditarPrestador;
