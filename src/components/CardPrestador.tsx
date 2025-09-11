import { Avatar, Box, Card, CardContent, Chip, Stack, Typography, Rating } from "@mui/material";

interface CardPrestadorProps {
  nome: string;
  categoria: string;
  cidade: string;
  estado: string;
  telefone: string;
  foto?: string;
  mediaAvaliacao?: number; 
  descricao: string;
}

export default function CardPrestador({
  nome,
  categoria,
  cidade,
  estado,
  telefone,
  foto,
  mediaAvaliacao = 0,
  descricao
}: CardPrestadorProps) {

  console.log("Média recebida:", mediaAvaliacao, typeof mediaAvaliacao);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: "hidden", transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={foto ?? undefined} alt={nome} sx={{ width: 64, height: 64, fontSize: 24 }}>
            {nome[0]}
          </Avatar>

          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="h6" fontWeight="bold">{nome}</Typography>
              <Chip size="small" color="primary" label={categoria} sx={{ fontWeight: 500 }} />
            </Stack>

            <Typography variant="body2" color="text.secondary">{cidade}, {estado}</Typography>
            <Typography variant="body2" color="text.secondary">{telefone}</Typography>
            <Typography variant="body2" color="text.secondary">{descricao}</Typography>


            <Stack direction="row" alignItems="center" spacing={1} mt={1}>
              <Rating value={mediaAvaliacao} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">{mediaAvaliacao.toFixed(1)} / 5</Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
