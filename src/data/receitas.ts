import type { ImageProps } from "expo-image";

export type Ingrediente = {
  nome: string;
  quantidade: string;
};

export type Receita = {
  id: string;
  titulo: string;
  tempo: string;
  porcoes: number;
  categoria: string;
  cor: string;
  imagem?: ImageProps["source"];
  ingredientes: Ingrediente[];
  passos: string[];
};
