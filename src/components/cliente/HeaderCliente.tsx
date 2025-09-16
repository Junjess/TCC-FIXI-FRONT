import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { Home, History, Search, SmartToy } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

interface HeaderClienteProps {
  onEditarPerfil: () => void; 
  onLogout: () => void;       
}

const HeaderCliente: React.FC<HeaderClienteProps> = ({ onEditarPerfil, onLogout }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#395195" }}>
      <Toolbar>
        <Box
          component="img"
          src={require("../../assets/LogoFixiDark.png")}
          alt="Logo Fixi"
          sx={{ width: 80, height: 40, cursor: "pointer" }}
          onClick={() => navigate("/home/cliente")}
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
            onClick={() => navigate("/recomendacoes")}
          >
            IA Recomendações
          </Button>
          <Button
            color="inherit"
            startIcon={<History />}
            sx={{ textTransform: "none", fontWeight: "bold", mr: 3 }}
            onClick={() => navigate("/historico/cliente")}
          >
            Histórico
          </Button>
        </Box>

        <IconButton color="inherit" onClick={handleMenuOpen}>
          {user?.foto ? (
            <Avatar src={`data:image/jpeg;base64,${user.foto}`} alt={user.nome} />
          ) : (
            <Avatar>{user?.nome?.[0] ?? "C"}</Avatar>
          )}
        </IconButton>

        {/* Menu perfil */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onEditarPerfil();
            }}
          >
            Editar Perfil
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onLogout();
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderCliente;
