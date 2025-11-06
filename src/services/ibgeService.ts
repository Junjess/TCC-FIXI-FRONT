import axios from "axios";

export const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA",
  "MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN",
  "RO","RR","RS","SC","SE","SP","TO",
] as const;

type Municipio = { id: number; nome: string };
const cache = new Map<string, string[]>(); // UF -> cidades

export async function listarCidadesPorUF(uf: string): Promise<string[]> {
  if (cache.has(uf)) return cache.get(uf)!;
  const { data } = await axios.get<Municipio[]>(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
  );
  const nomes = data.map(m => m.nome).sort((a,b)=>a.localeCompare(b,"pt-BR"));
  cache.set(uf, nomes);
  return nomes;
}