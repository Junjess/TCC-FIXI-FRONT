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

  const [tipoUsuario, setTipoUsuario] = useState<"cliente" | "prestador">("cliente");
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<number[]>([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [descricao, setDescricao] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [consentimento, setConsentimento] = useState<"aceito" | "naoAceito" | "">("");

  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: "error",
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const login = async () => {
    try {
      if (tipoUsuario === "cliente") {
        const resp = await loginClienteService({ email, senha, tipoUsuario: "CLIENTE" });
        setUser(resp.usuario, resp.token);
        navigate("/home/cliente");
      } else {
        const resp = await loginPrestadorService({ email, senha, tipoUsuario: "PRESTADOR" });
        setUser(resp.usuario, resp.token);
        navigate("/home/prestador");
      }

      setSnackbar({
        open: true,
        message: "Conta logada com sucesso!",
        severity: "success",
      });
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
      if (categoriasSelecionadas.length === 0) errors.push("Tipo de Serviço é obrigatório");
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
      if (tipoUsuario === "cliente") {
        const resp = await cadastroClienteService({
          nome,
          email,
          senha,
          telefone,
          cep,
          tipoUsuario: "CLIENTE",
        });
        setUser(resp);
        navigate("/home/cliente");
      } else {
        const resp = await cadastroPrestadorService({
          nome,
          email,
          senha,
          telefone,
          cep,
          tipoUsuario: "PRESTADOR",
          descricao,
          categoriasIds: categoriasSelecionadas,
        });
        setUser(resp);
        navigate("/home/prestador");
      }

      setSnackbar({
        open: true,
        message: "Conta criada com sucesso!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Erro ao cadastrar usuário",
        severity: "error",
      });
    }
  };

  function formatTelefone(value: string) {
    value = value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      return `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else {
      return value;
    }
  }

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
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.background.paper} 100%)`,
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
                label="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                required
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
                    <FormLabel>Categorias de serviço</FormLabel>
                    <Select
                      multiple
                      value={categoriasSelecionadas}
                      onChange={(e) => setCategoriasSelecionadas(e.target.value as number[])}
                      renderValue={(selected) =>
                        serviceTypes
                          .filter((type) => selected.includes(type.id))
                          .map((type) => type.nome)
                          .join(", ")
                      }
                      sx={{ flex: "1 1 100%", backgroundColor: theme.palette.background.default }}
                    >
                      {serviceTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>

            {/* Termo de Consentimento */}
            <FormControl sx={{ mt: 3, width: "100%" }}>
              <FormLabel>Termo de Consentimento</FormLabel>
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.default,
                  fontSize: "0.9rem",
                  maxHeight: 150,
                  overflowY: "auto",
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Ao prosseguir com o cadastro, você declara estar ciente e de acordo que:
                </Typography>
                <ul style={{ marginLeft: "1.2rem", marginBottom: "0.5rem" }}>
                  <li>Seus dados pessoais serão utilizados exclusivamente para cadastro, autenticação e funcionamento da plataforma FIXI.</li>
                  <li>Suas informações de contato (telefone, e-mail ou outro informado) poderão ser compartilhadas entre Clientes e Prestadores, para que possam se comunicar diretamente, visto que a FIXI não possui chat interno.</li>
                  <li>Seus dados serão armazenados em ambiente seguro, com medidas técnicas e organizacionais adequadas para proteção contra acessos não autorizados.</li>
                  <li>Você poderá solicitar, a qualquer momento, a exclusão, atualização ou correção de seus dados, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).</li>
                  <li>Clientes e Prestadores concordam que poderão ser avaliados após a realização de serviços, compondo o sistema de reputação da FIXI.</li>
                  <li>A FIXI atua apenas como intermediadora entre Clientes e Prestadores, não sendo responsável pela execução dos serviços contratados.</li>
                </ul>
              </Box>

              <RadioGroup
                value={consentimento}
                onChange={(e) => setConsentimento(e.target.value as "aceito" | "naoAceito")}
              >
                <FormControlLabel value="aceito" control={<Radio />} label="Li e ACEITO os termos" />
                <FormControlLabel value="naoAceito" control={<Radio />} label="Li e NÃO ACEITO os termos" />
              </RadioGroup>

              {consentimento === "naoAceito" && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  ⚠ Você não poderá se cadastrar sem aceitar o termo de consentimento.
                </Typography>
              )}
            </FormControl>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                variant="contained"
                onClick={cadastro}
                disabled={consentimento !== "aceito"}
                sx={{
                  backgroundColor: consentimento === "aceito" ? "#395195" : "#aaa",
                  color: "#ffffff",
                  fontWeight: "bold",
                  py: 1.5,
                  "&:hover": { backgroundColor: consentimento === "aceito" ? "#2e4170" : "#aaa" },
                }}
              >
                Cadastrar
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Snackbar */}
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
