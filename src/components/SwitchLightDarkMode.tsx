import React from "react";
import { Button } from "@mui/material";

type ButtonCustomProps = {
  children: React.ReactNode;
  onClick?: () => void;
}

export default function ButtonCustom({ children, onClick }:ButtonCustomProps){
  return (
    <Button
      onClick={onClick}
      variant="contained"
      sx={{
        backgroundColor: "primary.main",
        color: "secondary.main",
        fontWeight: "bold",
        paddingX: 4,
        paddingY: 1.5,
        fontSize: "1rem",
        borderRadius: 2,
        "&:hover": { backgroundColor: "#315ec9" },
      }}
    >
      {children}
    </Button>
  );
};
