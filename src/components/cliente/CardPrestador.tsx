import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Rating,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface CategoriaDescricaoDTO {
  nomeCategoria: string;
  descricao?: string | null;
}

interface CardPrestadorProps {
  id: number;
  nome: string;
  categorias: CategoriaDescricaoDTO[]; // ✅ agora lista
  cidade: string;
  estado: string;
  telefone: string;
  foto?: string;
  mediaAvaliacao?: number;
  descricao: string;
}

export default function CardPrestador({
  id,
  nome,
  categorias,
  cidade,
  estado,
  telefone,
  foto,
  mediaAvaliacao = 0,
  descricao,
}: CardPrestadorProps) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        overflow: "hidden",
        transition: "0.3s",
        "&:hover": { boxShadow: 6 },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={foto ? `data:image/jpeg;base64,${foto}` : undefined}
            alt={nome}
            sx={{ width: 64, height: 64, fontSize: 24 }}
          >
            {nome[0]}
          </Avatar>

          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              {nome}
            </Typography>

            {/* 🔹 Renderiza todas as categorias */}
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {categorias.map((cat, idx) => (
                <Chip
                  key={idx}
                  size="small"
                  color="primary"
                  label={cat.nomeCategoria}
                  sx={{ fontWeight: 500 }}
                />
              ))}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {cidade}, {estado}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {telefone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {descricao}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1} mt={1}>
              <Rating
                value={mediaAvaliacao}
                precision={0.5}
                readOnly
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {mediaAvaliacao.toFixed(1)} / 5
              </Typography>
            </Stack>

            {/* Botão para visualizar perfil */}
            <Button
              variant="outlined"
              color="inherit"
              sx={{ mt: 2 }}
              onClick={() => navigate(`/prestador/${id}`)}
            >
              Visualizar Perfil
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
