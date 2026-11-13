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

export const RECEITAS: Receita[] = [
  {
    id: "1",
    titulo: "Bolo de cenoura",
    tempo: "50 min",
    porcoes: 8,
    categoria: "Sobremesas",
    cor: "#F3E3C8",
    ingredientes: [
      { nome: "Cenoura", quantidade: "3 unidades" },
      { nome: "Ovos", quantidade: "3 unidades" },
      { nome: "Óleo", quantidade: "1/2 xícara" },
      { nome: "Açúcar", quantidade: "2 xícaras" },
      { nome: "Farinha de trigo", quantidade: "2 xícaras" },
    ],
    passos: [
      "Bata no liquidificador a cenoura, os ovos e o óleo até ficar homogêneo.",
      "Misture o açúcar e a farinha e, por último, o fermento.",
      "Despeje em forma untada e asse em forno preaquecido a 180 °C por cerca de 40 minutos.",
      "Deixe esfriar um pouco antes de desenformar.",
    ],
  },
  {
    id: "2",
    imagem: "https://sabores-new.s3.amazonaws.com/public/2024/11/Lasanha_tradicional.jpg",
    titulo: "Lasanha",
    tempo: "1 h 20",
    porcoes: 6,
    categoria: "Massas",
    cor: "#F0D9D2",
    ingredientes: [
      { nome: "Massa de lasanha", quantidade: "500 g" },
      { nome: "Carne moída", quantidade: "500 g" },
      { nome: "Molho de tomate", quantidade: "2 xícaras" },
      { nome: "Presunto", quantidade: "200 g" },
      { nome: "Queijo muçarela", quantidade: "300 g" },
    ],
    passos: [
      "Refogue a carne moída e misture o molho de tomate. Tempere com sal e cozinhe por alguns minutos.",
      "Em um refratário, alterne camadas de molho, massa, presunto e queijo.",
      "Finalize com queijo e leve ao forno preaquecido a 180 °C por cerca de 40 minutos.",
      "Espere alguns minutos antes de cortar e servir.",
    ],
  },
  {
    id: "3",
    titulo: "Salada Caesar",
    tempo: "20 min",
    porcoes: 2,
    categoria: "Saladas",
    cor: "#E2ECD8",
    ingredientes: [
      { nome: "Alface romana", quantidade: "1 unidade" },
      { nome: "Croutons", quantidade: "1 xícara" },
      { nome: "Queijo parmesão", quantidade: "50 g" },
      { nome: "Molho Caesar", quantidade: "1/2 xícara" },
    ],
    passos: [
      "Lave e rasgue as folhas de alface em pedaços médios.",
      "Misture a alface com o molho Caesar até cobrir as folhas.",
      "Acrescente os croutons e finalize com o queijo parmesão ralado.",
    ],
  },
  {
    id: "4",
    titulo: "Brigadeiro",
    tempo: "30 min",
    porcoes: 20,
    categoria: "Sobremesas",
    cor: "#E6DDEE",
    ingredientes: [
      { nome: "Leite condensado", quantidade: "1 lata" },
      { nome: "Chocolate em pó", quantidade: "2 colheres" },
      { nome: "Manteiga", quantidade: "1 colher" },
      { nome: "Chocolate granulado", quantidade: "1 xícara" },
    ],
    passos: [
      "Leve o leite condensado, o chocolate e a manteiga ao fogo baixo, mexendo sempre.",
      "Cozinhe até o brigadeiro desgrudar do fundo da panela.",
      "Deixe esfriar, enrole em bolinhas e passe no granulado.",
    ],
  },
  {
    id: "5",
    titulo: "Pão de queijo",
    tempo: "45 min",
    porcoes: 15,
    categoria: "Lanches",
    cor: "#EFE6BF",
    ingredientes: [
      { nome: "Polvilho doce", quantidade: "500 g" },
      { nome: "Queijo minas", quantidade: "250 g" },
      { nome: "Leite", quantidade: "1 xícara" },
      { nome: "Ovos", quantidade: "2 unidades" },
      { nome: "Óleo", quantidade: "1/2 xícara" },
    ],
    passos: [
      "Aqueça o leite com o óleo e despeje sobre o polvilho, mexendo bem.",
      "Espere amornar, junte os ovos e o queijo ralado e misture até formar uma massa homogênea.",
      "Modele bolinhas e asse em forno preaquecido a 180 °C por cerca de 25 minutos.",
    ],
  },
  {
    id: "6",
    titulo: "Macarrão alho e óleo",
    tempo: "25 min",
    porcoes: 2,
    categoria: "Massas",
    cor: "#DDE7EC",
    ingredientes: [
      { nome: "Macarrão", quantidade: "250 g" },
      { nome: "Alho", quantidade: "4 dentes" },
      { nome: "Azeite", quantidade: "1/2 xícara" },
      { nome: "Salsinha", quantidade: "a gosto" },
      { nome: "Sal", quantidade: "a gosto" },
    ],
    passos: [
      "Cozinhe o macarrão em água salgada até ficar al dente e escorra.",
      "Doure o alho fatiado no azeite, sem deixar queimar.",
      "Misture o macarrão ao alho e ao azeite e finalize com salsinha.",
    ],
  },
];

export function buscarReceita(id: string) {
  return RECEITAS.find((receita) => receita.id === id);
}
