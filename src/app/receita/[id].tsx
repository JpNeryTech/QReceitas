
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  buscarReceita,
  type Receita as ReceitaTipo,
} from "../../data/receitas";

import { buscarReceitaFirebase } from "../../services/receitaService";

// CORES
const COR_TEXTO = "#1B1F1C";
const COR_SUAVE = "#5C655E";
const COR_VERDE = "#2F7D4F";
const COR_BORDA = "#E1E5DE";
const COR_DELETAR = "#C44536";

// FORMATAÇÃO
function formatarPorcoes(quantidade: number) {
  return quantidade === 1 ? "1 porção" : `${quantidade} porções`;
}

// COMPONENTE PRINCIPAL
export default function Receita() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const alturaFoto = Math.max(
    250,
    Math.round(height * 0.34)
  );

  // Primeiro procura nas receitas locais
  const receitaLocal =
    typeof id === "string"
      ? buscarReceita(id)
      : undefined;

  // Estado da receita vinda do Firebase
  const [resultadoFirebase, setResultadoFirebase] = useState<{
    id: string;
    receita: ReceitaTipo | null;
  } | null>(null);

  const [erroFirebase, setErroFirebase] = useState<{
    id: string;
    mensagem: string;
  } | null>(null);

  // Busca no Firestore apenas se não encontrar localmente
  useEffect(() => {
    if (typeof id !== "string" || receitaLocal) {
      return;
    }

    let ativo = true;

    async function carregarReceita() {
      try {
        const resultado = await buscarReceitaFirebase(id as string);

        if (ativo) {
          setResultadoFirebase({
            id: id as string,
            receita: resultado,
          });
        }
      } catch (erro) {
        console.error(
          "Erro ao buscar receita no Firebase:",
          erro
        );

        if (ativo) {
          setErroFirebase({
            id: id as string,
            mensagem:
              "Não foi possível carregar a receita. Verifique sua conexão e as permissões do Firestore.",
          });
        }
      }
    }

    carregarReceita();

    return () => {
      ativo = false;
    };
  }, [id, receitaLocal]);

  // Receita definitiva
  const receita =
    receitaLocal ??
    (resultadoFirebase?.id === id
      ? resultadoFirebase.receita
      : null);

  // Estados de carregamento e erro
  const carregando =
    !receitaLocal &&
    typeof id === "string" &&
    resultadoFirebase?.id !== id &&
    erroFirebase?.id !== id;

  const mensagemErro =
    erroFirebase?.id === id
      ? erroFirebase.mensagem
      : "Receita não encontrada.";

  // Botão de voltar reutilizável
  function BotaoVoltar() {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={() => router.back()}
        style={styles.botaoRedondo}
      >
        <SymbolView
          name={{
            ios: "chevron.left",
            android: "arrow_back",
            web: "arrow_back",
          }}
          size={20}
          tintColor={COR_TEXTO}
        />
      </Pressable>
    );
  }

  // CARREGANDO
  if (carregando) {
    return (
      <View
        style={[
          styles.tela,
          {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={COR_VERDE}
        />

        <Text style={styles.carregandoTexto}>
          Carregando receita...
        </Text>
      </View>
    );
  }

  // RECEITA NÃO ENCONTRADA
  if (!receita) {
    return (
      <View
        style={[
          styles.tela,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <BotaoVoltar />

        <Text style={styles.naoEncontrada}>
          {mensagemErro}
        </Text>
      </View>
    );
  }

  // RECEITA ENCONTRADA
  return (
    <View style={styles.tela}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* IMAGEM DA RECEITA */}
        <View
          style={[
            styles.foto,
            {
              backgroundColor: receita.cor,
              height: alturaFoto,
            },
          ]}
        >
          {receita.imagem ? (
            <Image
              source={receita.imagem}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessibilityLabel={`Foto de ${receita.titulo}`}
            />
          ) : null}

          {/* BOTÃO VOLTAR */}
          <View
            style={[
              styles.barra,
              { paddingTop: insets.top + 8 },
            ]}
          >
            <BotaoVoltar />
          </View>

          {/* IMAGEM NÃO DISPONÍVEL */}
          {!receita.imagem && (
            <View style={styles.fotoCentro}>
              <SymbolView
                name={{
                  ios: "photo",
                  android: "image",
                  web: "image",
                }}
                size={34}
                tintColor={COR_SUAVE}
              />

              <Text style={styles.fotoLegenda}>
                Foto da receita
              </Text>
            </View>
          )}
        </View>

        {/* CONTEÚDO */}
        <View style={styles.conteudo}>
          <Text style={styles.categoria}>
            {receita.categoria.toUpperCase()}
          </Text>

          <Text style={styles.titulo}>
            {receita.titulo}
          </Text>

          {/* TEMPO E PORÇÕES */}
          <View style={styles.pills}>
            <View style={styles.pill}>
              <SymbolView
                name={{
                  ios: "clock",
                  android: "schedule",
                  web: "schedule",
                }}
                size={16}
                tintColor={COR_TEXTO}
              />

              <Text style={styles.pillTexto}>
                {receita.tempo}
              </Text>
            </View>

            <View style={styles.pill}>
              <SymbolView
                name={{
                  ios: "person.2",
                  android: "group",
                  web: "group",
                }}
                size={16}
                tintColor={COR_TEXTO}
              />

              <Text style={styles.pillTexto}>
                {formatarPorcoes(receita.porcoes)}
              </Text>
            </View>
          </View>

          {/* INGREDIENTES */}
          <Text style={styles.secao}>
            Ingredientes
          </Text>

          <View>
            {receita.ingredientes.map(
              (ingrediente, indice) => (
                <View
                  key={`${indice}-${ingrediente.nome}`}
                  style={[
                    styles.ingrediente,
                    indice <
                      receita.ingredientes.length - 1 &&
                      styles.divisor,
                  ]}
                >
                  <Text style={styles.ingredienteNome}>
                    {ingrediente.nome}
                  </Text>

                  <Text style={styles.ingredienteQtd}>
                    {ingrediente.quantidade}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* MODO DE PREPARO */}
          <Text style={styles.secao}>
            Modo de preparo
          </Text>

          <View style={styles.passos}>
            {receita.passos.map(
              (passo, indice) => (
                <View
                  key={`passo-${indice}`}
                  style={styles.passo}
                >
                  <View style={styles.passoNumero}>
                    <Text
                      style={styles.passoNumeroTexto}
                    >
                      {indice + 1}
                    </Text>
                  </View>

                  <Text style={styles.passoTexto}>
                    {passo}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* AÇÕES */}
          <View style={styles.acoes}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar receita"
              disabled
              style={styles.botaoEditar}
            >
              <Text style={styles.botaoEditarTexto}>
                Editar
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Deletar receita"
              disabled
              style={styles.botaoDeletar}
            >
              <Text style={styles.botaoDeletarTexto}>
                Deletar
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#F7F8F5",
  },

  carregandoTexto: {
    marginTop: 12,
    fontSize: 15,
    color: COR_SUAVE,
  },

  foto: {
    overflow: "hidden",
  },

  barra: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  botaoRedondo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B1F1C",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  fotoCentro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 36,
  },

  fotoLegenda: {
    fontSize: 14,
    color: COR_SUAVE,
  },

  conteudo: {
    marginTop: -28,
    backgroundColor: "#F7F8F5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },

  categoria: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: COR_VERDE,
  },

  titulo: {
    fontSize: 30,
    fontWeight: "700",
    color: COR_TEXTO,
    marginTop: -8,
  },

  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COR_BORDA,
    backgroundColor: "#FFFFFF",
  },

  pillTexto: {
    fontSize: 14,
    fontWeight: "500",
    color: COR_TEXTO,
  },

  secao: {
    fontSize: 20,
    fontWeight: "700",
    color: COR_TEXTO,
    marginTop: 8,
  },

  ingrediente: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    paddingVertical: 14,
  },

  divisor: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COR_BORDA,
  },

  ingredienteNome: {
    flex: 1,
    fontSize: 16,
    color: COR_TEXTO,
  },

  ingredienteQtd: {
    fontSize: 15,
    color: COR_SUAVE,
  },

  passos: {
    gap: 16,
  },

  passo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  passoNumero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5F3EA",
    alignItems: "center",
    justifyContent: "center",
  },

  passoNumeroTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: COR_VERDE,
  },

  passoTexto: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: COR_TEXTO,
  },

  acoes: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },

  botaoEditar: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COR_BORDA,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },

  botaoDeletar: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COR_DELETAR,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },

  botaoEditarTexto: {
    fontSize: 15,
    fontWeight: "600",
    color: COR_TEXTO,
  },

  botaoDeletarTexto: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  naoEncontrada: {
    marginTop: 24,
    paddingHorizontal: 20,
    fontSize: 15,
    color: COR_SUAVE,
  },
});
