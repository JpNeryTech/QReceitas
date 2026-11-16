
import { File } from "expo-file-system";
import type { ImagePickerAsset } from "expo-image-picker";
import { fetch as expoFetch } from "expo/fetch";
import { Platform } from "react-native";

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../config/cloudinary";

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

export async function enviarImagemCloudinary(
  imagem: ImagePickerAsset
): Promise<string> {
  try {
  if (!CLOUDINARY_CLOUD_NAME.trim()) {
  throw new Error("Configure o Cloud Name no Cloudinary.");
}

    if (imagem.fileSize && imagem.fileSize > TAMANHO_MAXIMO) {
      throw new Error("A imagem deve ter no máximo 5 MB.");
    }

    const formData = new FormData();

    if (Platform.OS === "web") {
      const respostaArquivo = await expoFetch(imagem.uri);
      const blob = await respostaArquivo.blob();

      if (blob.size > TAMANHO_MAXIMO) {
        throw new Error("A imagem deve ter no máximo 5 MB.");
      }

      formData.append(
        "file",
        blob,
        imagem.fileName ?? "receita.jpg"
      );
    } else {
      // Arquivo nativo compatível com o Expo.
      const arquivo = new File(imagem.uri);

      if (!arquivo.exists) {
        throw new Error("A imagem não foi encontrada no celular.");
      }

      if (arquivo.size > TAMANHO_MAXIMO) {
        throw new Error("A imagem deve ter no máximo 5 MB.");
      }

      formData.append("file", arquivo);
    }

    formData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET
    );

    const url =
      `https://api.cloudinary.com/v1_1/` +
      `${CLOUDINARY_CLOUD_NAME}/image/upload`;

    console.log("Iniciando upload no Cloudinary...");

    const resposta = await expoFetch(url, {
      method: "POST",
      body: formData,
    });

    const resultado = await resposta.json();

    if (
      !resposta.ok ||
      !resultado ||
      typeof resultado !== "object" ||
      !("secure_url" in resultado)
    ) {
      const mensagem =
        resultado &&
        typeof resultado === "object" &&
        "error" in resultado
          ? JSON.stringify(resultado.error)
          : "Erro ao enviar imagem.";

      throw new Error(mensagem);
    }

    const imagemUrl = resultado.secure_url;

    if (typeof imagemUrl !== "string") {
      throw new Error("Cloudinary não retornou uma URL válida.");
    }

    console.log("Imagem enviada com sucesso!");

    return imagemUrl;
  } catch (erro) {
    console.error("Erro no Cloudinary:", erro);
    throw erro;
  }
}
