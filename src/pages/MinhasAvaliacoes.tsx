import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Rating,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import {
  buscarPrestadorPorId,
  PrestadorDetalhesDTO,
  PrestadorProfileDTO,
  atualizarPrestador,
  atualizarFotoPrestador,
} from "../services/prestadorService";
import TrocarTema from "../components/TrocarTema";
import HeaderPrestador from "../components/prestador/HeaderPrestador";
import DialogEditarPrestador from "../components/prestador/DialogEditarPrestador";

function MinhasAvaliacoes() {
  const { user, setUser } = useUser();
  const [prestador, setPrestador] = useState<PrestadorDetalhesDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Controle do modal de edição
  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const resp = await buscarPrestadorPorId(user.id);
        setPrestador(resp);
      } catch (err) {
        console.error("Erro ao carregar avaliações:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // 🔹 Função de salvar perfil (chamada pelo DialogEditarPrestador)
  const handleSave = async (
    formData: Partial<PrestadorProfileDTO>,
    fotoFile: File | null
  ) => {
    if (!user?.id) return;
    setSaving(true);
    try {
      // Atualiza dados principais
      const updated = await atualizarPrestador(user.id, formData);

      let updatedUser = updated;

      // Atualiza foto (se tiver)
      if (fotoFile) {
        const fotoResp = await atualizarFotoPrestador(user.id, fotoFile);
        updatedUser = fotoResp;
      }

      // Atualiza contexto → HeaderPrestador reflete automaticamente
      setUser(updatedUser);

      // Atualiza estado local mantendo categorias originais
      setPrestador((prev) =>
        prev
          ? {
            ...prev,
            ...updatedUser,
            categorias: prev.categorias, // mantém formato do PrestadorDetalhesDTO
          }
          : prev
      );
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Header do Prestador */}
      <HeaderPrestador onEditarPerfil={() => setOpenDialog(true)} />

      <Box p={2}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Minhas Avaliações
        </Typography>

        {prestador && (
          <Paper
            elevation={3}
            sx={{ p: 2, mb: 3, borderRadius: 3, textAlign: "center" }}
          >
            <Typography variant="h6" fontWeight="bold">
              Média Geral
            </Typography>
            <Rating
              value={prestador.mediaAvaliacao || 0}
              precision={0.5}
              readOnly
              size="large"
            />
            <Typography variant="body2" color="text.secondary">
              {prestador.mediaAvaliacao
                ? `${prestador.mediaAvaliacao.toFixed(1)} estrelas`
                : "Sem avaliações ainda"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {prestador.avaliacoes?.length || 0} avaliação(ões)
            </Typography>
          </Paper>
        )}

        {!prestador?.avaliacoes || prestador.avaliacoes.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Você ainda não recebeu nenhuma avaliação.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {prestador.avaliacoes.map((av, index) => (
              <Card key={index} sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar>{av.clienteNome[0]}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {av.clienteNome}
                      </Typography>
                      <Rating value={av.nota} precision={0.5} readOnly />
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" gutterBottom>
                    {av.descricao || "Sem comentário."}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
        <TrocarTema />
      </Box>

      {/* Modal de edição do perfil */}
      {user && (
        <DialogEditarPrestador
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          user={user as PrestadorProfileDTO}
          onSave={async (formData, fotoFile) => {
            try {
              let updated = user;

              // 🔹 Atualiza os dados principais do prestador
              if (Object.keys(formData).length > 0) {
                updated = await atualizarPrestador(user.id, formData);
              }

              // 🔹 Atualiza a foto, se houver nova
              if (fotoFile) {
                updated = await atualizarFotoPrestador(user.id, fotoFile);
              }

              setUser(updated); // ✅ garante que o contexto é atualizado
            } catch (error) {
              console.error("Erro ao salvar prestador:", error);
              alert("Erro ao salvar prestador");
            }
          }}
          loading={saving}
        />
      )}
    </>
  );
}

export default MinhasAvaliacoes;
