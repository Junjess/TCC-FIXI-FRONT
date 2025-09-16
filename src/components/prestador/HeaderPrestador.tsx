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
import { Home, BuildCircle, Star, AccountCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

type HeaderPrestadorProps = {
    onEditarPerfil: () => void;
};

const HeaderPrestador: React.FC<HeaderPrestadorProps> = ({ onEditarPerfil }) => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditarPerfil = () => {
        setAnchorEl(null);
        onEditarPerfil();
    };

    const handleLogout = () => {
        setAnchorEl(null);
        setUser(null);
        navigate("/main");
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: "#395195" }}>
            <Toolbar>
                <Box
                    component="img"
                    src={require("../../assets/LogoFixiDark.png")}
                    alt="Logo Fixi"
                    sx={{ width: 80, height: 40, cursor: "pointer" }}
                />

                <Box sx={{ ml: "auto" }}>
                    <Button
                        color="inherit"
                        startIcon={<Home />}
                        sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
                        onClick={() => navigate("/home/prestador")}
                    >
                        Início
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<BuildCircle />}
                        sx={{ textTransform: "none", fontWeight: "bold", mr: 4 }}
                        onClick={() => navigate("/solicitacoes")}
                    >
                        Solicitação de Agendamento
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<Star />}
                        sx={{ textTransform: "none", fontWeight: "bold", mr: 3 }}
                        onClick={() => navigate("/avaliacoes")}
                    >
                        Minhas Avaliações
                    </Button>
                </Box>

                <IconButton color="inherit" onClick={handleMenuOpen}>
                    {user?.foto ? (
                        <Avatar src={`data:image/jpeg;base64,${user.foto}`} alt={user.nome} />
                    ) : (
                        <AccountCircle />
                    )}
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleEditarPerfil}>Editar Perfil</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default HeaderPrestador;
