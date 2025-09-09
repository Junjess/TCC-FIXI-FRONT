import React from "react";
import { AppBar, Toolbar, Button, Box, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

type AppBarCustomProps = {
  onLoginClick: () => void;
  onSignupClick: () => void;
};

export default function AppBarCustom({ onLoginClick, onSignupClick }: AppBarCustomProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const logo =
    theme.palette.mode === "dark"
      ? require("../assets/LogoFixiDark.png")
      : require("../assets/LogoFixiLight.png");

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ background: "transparent", boxShadow: "none", px: 5, py: 2 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box
          component="img"
          src={logo}
          alt="Logo Fixi"
          sx={{ width: 90, height: 50, cursor: "pointer" }}
          onClick={() => navigate("/main")}
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "primary.main",
              color: "secondary.main",
              fontWeight: "bold",
              minWidth: 100,
              "&:hover": { backgroundColor: "#395195" },
            }}
            onClick={onLoginClick}
          >
            Login
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "primary.main",
              color: "secondary.main",
              fontWeight: "bold",
              minWidth: 100,
              "&:hover": { backgroundColor: "#395195" },
            }}
            onClick={onSignupClick}
          >
            Cadastro
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
