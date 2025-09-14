import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  useTheme,
  Dialog,
  DialogContent,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff, Person } from "@mui/icons-material";
import AppBarCustom from "../components/AppBarCustom";
import TrocarTema from "../components/TrocarTema";
import { useNavigate } from "react-router-dom";
import {
  cadastroClienteService,
  cadastroPrestadorService,
  loginClienteService,
  loginPrestadorService,
} from "../services/autenticacaoServices";
import { useUser } from "../contexts/UserContext";

const serviceTypes = [
  "Eletricista",
  "Encanador",
  "Pedreiro",
  "Jardineiro",
  "Cozinheiro Privado",
  "Babá",
  "Motorista",
  "Dog Walker",
  "Faxineiro",
  "Professor Particular",
  "Manicure/Pedicure",
  "Assistente Virtual",
  "Fotógrafo",
  "Consultor de TI",
];

type SnackbarType = {
  open: boolean;
  message: string;
  severity: "error" | "success" | "warning" | "info";
};

const MainPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [tipoUsuario, setTipoUsuario] = useState<"cliente" | "prestador">(
    "cliente"
  );
  const [tipoServico, setTipoServico] = useState(serviceTypes[0]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [descricao, setDescricao] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: "error",
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const login = async () => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) errors.push("Email é obrigatório");
    else if (!emailRegex.test(email)) errors.push("Insira um email válido");
    if (!senha) errors.push("Senha é obrigatória");
    if (!tipoUsuario) errors.push("Tipo de usuário é obrigatório");

    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors.join("\n"),
        severity: "error",
      });
      return;
    }

    try {
      const resp =
        tipoUsuario === "cliente"
          ? await loginClienteService({ email, senha, tipoUsuario })
          : await loginPrestadorService({ email, senha, tipoUsuario });

      if (resp.status === 200 || resp.status === 201) {
        setSnackbar({
          open: true,
          message: "Conta logada com sucesso!",
          severity: "success",
        });
        setUser(resp.data);
        navigate(tipoUsuario === "cliente" ? "/home/cliente" : "/home/prestador");
      } else {
        setSnackbar({
          open: true,
          message: resp.data?.message || "Erro ao logar usuário",
          severity: "error",
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao logar",
        severity: "error",
      });
    }
  };

  const buscarCep = async (valor: string) => {
    const cepLimpo = valor.replace(/\D/g, "");
    setCep(valor);

    if (cepLimpo.length < 8) {
      setCidade("");
      setEstado("");
      return;
    }

    if (cepLimpo.length === 8) {
      try {
        const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await resp.json();

        if (!data.erro) {
          setCidade(data.localidade || "");
          setEstado(data.uf || "");
        } else {
          setCidade("");
          setEstado("");
          setSnackbar({
            open: true,
            message: "CEP não encontrado",
            severity: "warning",
          });
        }
      } catch {
        setCidade("");
        setEstado("");
        setSnackbar({
          open: true,
          message: "Erro ao buscar CEP",
          severity: "error",
        });
      }
    }
  };

  const cadastro = async () => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) errors.push("Email é obrigatório");
    else if (!emailRegex.test(email)) errors.push("Insira um email válido");
    if (!senha) errors.push("Senha é obrigatória");
    if (!nome) errors.push("Nome é obrigatório");
    if (!telefone) errors.push("Telefone é obrigatório");

    if (!cep) errors.push("CEP é obrigatório");
    else if (!cidade || !estado) errors.push("CEP inválido ou não localizado");

    if (tipoUsuario === "prestador") {
      if (!tipoServico) errors.push("Tipo de Serviço é obrigatório");
      if (!descricao) errors.push("Descrição é obrigatória");
    }

    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors.join("\n"),
        severity: "error",
      });
      return;
    }

    try {
      const resp =
        tipoUsuario === "cliente"
          ? await cadastroClienteService({
              nome,
              email,
              senha,
              telefone,
              cep,
              tipoUsuario,
            })
          : await cadastroPrestadorService({
              nome,
              email,
              senha,
              telefone,
              cep,
              tipoUsuario,
              tipoServico,
              descricao,
            });

      if (resp.status === 200 || resp.status === 201) {
        setSnackbar({
          open: true,
          message: "Conta criada com sucesso!",
          severity: "success",
        });
        setUser(resp.data);
        navigate(tipoUsuario === "cliente" ? "/home/cliente" : "/home/prestador");
      } else {
        setSnackbar({
          open: true,
          message: resp.data?.message || "Erro ao cadastrar usuário",
          severity: "error",
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao cadastrar",
        severity: "error",
      });
    }
  };

  return (
    <>
      <AppBarCustom
        onLoginClick={() => setLoginOpen(true)}
        onSignupClick={() => setSignupOpen(true)}
      />

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
          p: 3,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Container
            maxWidth="md"
            sx={{
              textAlign: "center",
              p: 5,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 3,
              boxShadow: 6,
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
            >
              Fixi
            </Typography>

            <Typography
              variant="h6"
              sx={{ color: theme.palette.text.primary, mb: 3 }}
            >
              A Fixi conecta os melhores prestadores de serviços com quem mais
              precisa de forma rápida, segura e eficiente. Encontre profissionais
              de confiança perto de você em poucos cliques!
            </Typography>
          </Container>
        </motion.div>

        {/* DIALOG LOGIN */}
        <Dialog
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          PaperProps={{
            sx: {
              width: 450,
              maxWidth: "90%",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: 8,
            },
          }}
        >
          <Box
            sx={{ backgroundColor: "#395195", py: 3, px: 2, textAlign: "center" }}
          >
            <Typography
              variant="h5"
              sx={{ color: "#ffffff", fontWeight: "bold" }}
            >
              Bem-vindo ao Login
            </Typography>
            <Typography sx={{ color: "#f0f0f0", mt: 1 }}>
              Preencha os dados para acessar sua conta
            </Typography>
          </Box>

          <DialogContent
            sx={{
              backgroundColor: theme.palette.background.paper,
              py: 4,
              px: 5,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <FormControl>
              <FormLabel>Tipo de usuário</FormLabel>
              <RadioGroup
                row
                value={tipoUsuario}
                onChange={(e) =>
                  setTipoUsuario(e.target.value as "cliente" | "prestador")
                }
              >
                <FormControlLabel
                  value="cliente"
                  control={<Radio />}
                  label="Cliente"
                />
                <FormControlLabel
                  value="prestador"
                  control={<Radio />}
                  label="Prestador"
                />
              </RadioGroup>
            </FormControl>

            <TextField
              label="E-mail"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Senha"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              onClick={login}
              sx={{
                backgroundColor: "#395195",
                color: "#ffffff",
                fontWeight: "bold",
                py: 1.5,
                "&:hover": { backgroundColor: "#2e4170" },
              }}
            >
              Entrar
            </Button>
          </DialogContent>
        </Dialog>

        {/* DIALOG CADASTRO */}
        <Dialog
          open={signupOpen}
          onClose={() => setSignupOpen(false)}
          PaperProps={{
            sx: {
              width: 550,
              maxWidth: "95%",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: 8,
            },
          }}
        >
          <Box
            sx={{ backgroundColor: "#395195", py: 3, px: 2, textAlign: "center" }}
          >
            <Typography
              variant="h5"
              sx={{ color: "#ffffff", fontWeight: "bold" }}
            >
              Cadastro
            </Typography>
            <Typography sx={{ color: "#f0f0f0", mt: 1 }}>
              Preencha os dados para criar sua conta
            </Typography>
          </Box>

          <DialogContent
            sx={{
              backgroundColor: theme.palette.background.paper,
              py: 4,
              px: 5,
            }}
          >
            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Tipo de usuário</FormLabel>
              <RadioGroup
                row
                value={tipoUsuario}
                onChange={(e) =>
                  setTipoUsuario(e.target.value as "cliente" | "prestador")
                }
              >
                <FormControlLabel
                  value="cliente"
                  control={<Radio />}
                  label="Cliente"
                />
                <FormControlLabel
                  value="prestador"
                  control={<Radio />}
                  label="Prestador"
                />
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {/* Campos comuns */}
              <TextField
                onChange={(e) => setNome(e.target.value)}
                label="Nome"
                sx={{ flex: "1 1 48%", backgroundColor: theme.palette.background.default }}
              />
              <TextField
                onChange={(e) => setEmail(e.target.value)}
                label="Email"
                type="email"
                sx={{ flex: "1 1 48%", backgroundColor: theme.palette.background.default }}
              />
              <TextField
                onChange={(e) => setSenha(e.target.value)}
                label="Senha"
                type={showPassword ? "text" : "password"}
                sx={{ flex: "1 1 48%", backgroundColor: theme.palette.background.default }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                onChange={(e) => setTelefone(e.target.value)}
                label="Telefone"
                sx={{ flex: "1 1 48%", backgroundColor: theme.palette.background.default }}
              />

              {/* Campo CEP */}
              <TextField
                label="CEP"
                value={cep}
                onChange={(e) => buscarCep(e.target.value)}
                sx={{ flex: "1 1 48%", backgroundColor: theme.palette.background.default }}
              />

              {/* Cidade e Estado preenchidos automaticamente */}
              <TextField
                value={cidade}
                label="Cidade"
                disabled
                sx={{ flex: "1 1 48%", backgroundColor: theme.palette.background.default }}
              />
              <TextField
                value={estado}
                label="Estado"
                disabled
                sx={{ flex: "1 1 48%", backgroundColor: theme.palette.background.default }}
              />

              {/* Campos extras para prestador */}
              {tipoUsuario === "prestador" && (
                <>
                  <FormControl sx={{ flex: "1 1 100%" }}>
                    <FormLabel>Tipo de serviço</FormLabel>
                    <Select
                      value={tipoServico}
                      onChange={(e) => setTipoServico(e.target.value)}
                      sx={{ flex: "1 1 100%", backgroundColor: theme.palette.background.default }}
                    >
                      {serviceTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    onChange={(e) => setDescricao(e.target.value)}
                    label="Descrição do serviço"
                    multiline
                    rows={3}
                    sx={{ flex: "1 1 100%", backgroundColor: theme.palette.background.default }}
                  />
                </>
              )}
            </Box>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                variant="contained"
                onClick={cadastro}
                sx={{
                  backgroundColor: "#395195",
                  color: "#ffffff",
                  fontWeight: "bold",
                  py: 1.5,
                  "&:hover": { backgroundColor: "#2e4170" },
                }}
              >
                Cadastrar
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%", whiteSpace: "pre-line" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <TrocarTema />
      </Box>
    </>
  );
};

export default MainPage;
