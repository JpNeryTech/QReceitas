
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Receita } from "../data/receitas";

const receitasCollection = collection(db, "receitas");

// Cadastrar receita no Firebase
export async function adicionarReceita(
  receita: Omit<Receita, "id">
): Promise<string> {
  const documento = await addDoc(receitasCollection, {
    ...receita,
    criadoEm: serverTimestamp(),
  });

  return documento.id;


  return documento.id;
}

// Listar todas as receitas do Firebase
export async function listarReceitasFirebase(): Promise<Receita[]> {
  const snapshot = await getDocs(receitasCollection);

  return snapshot.docs.map((documento) => {
    const dados = documento.data();

    return {
      id: documento.id,
      titulo: dados.titulo,
      tempo: dados.tempo,
      porcoes: dados.porcoes,
      categoria: dados.categoria,
      cor: dados.cor,
      ingredientes: dados.ingredientes,
      passos: dados.passos,
      ...(typeof dados.imagem === "string"
        ? { imagem: dados.imagem }
        : {}),
    } as Receita;
  });
}

// Buscar uma receita específica pelo ID
export async function buscarReceitaFirebase(
  id: string
): Promise<Receita | null> {
  const referencia = doc(db, "receitas", id);
  const snapshot = await getDoc(referencia);

  if (!snapshot.exists()) {
    return null;
  }

  const dados = snapshot.data();

  return {
    id: snapshot.id,
    titulo: dados.titulo,
    tempo: dados.tempo,
    porcoes: dados.porcoes,
    categoria: dados.categoria,
    cor: dados.cor,
    ingredientes: dados.ingredientes,
    passos: dados.passos,
    ...(typeof dados.imagem === "string"
      ? { imagem: dados.imagem }
      : {}),
  } as Receita;
}
