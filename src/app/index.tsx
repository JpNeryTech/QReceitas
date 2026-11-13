import { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { RECEITAS } from "../data/receitas";

const CATEGORIAS = ["Todas", "Sobremesas", "Massas", "Saladas", "Lanches"];

export default function Index() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  // NOVO: calcula a largura de cada card (2 por linha)
  const { width } = useWindowDimensions();
  const larguraCard = (width - 40 - 12) / 2; // 40 = padding da tela, 12 = espaço entre cards

  // NOVO: filtra as receitas pela categoria e pela busca
  const receitasFiltradas = RECEITAS.filter((receita) => {
    const bateCategoria =
      categoria === "Todas" || receita.categoria === categoria;
    const bateBusca = receita.titulo
      .toLowerCase()
      .includes(busca.toLowerCase());
    return bateCategoria && bateBusca;
  });

  return (
    <SafeAreaView style={styles.tela}>
      <FlatList
        data={receitasFiltradas}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.linha}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>Minhas receitas</Text>
            <Text style={styles.subtitulo}>O que vamos cozinhar hoje?</Text>

            <TextInput
              style={styles.busca}
              placeholder="Buscar por nome ou ingrediente"
              placeholderTextColor="#5C655E"
              value={busca}
              onChangeText={setBusca}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categorias}
            >
              {CATEGORIAS.map((item) => {
                const selecionada = item === categoria;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategoria(item)}
                    style={[styles.chip, selecionada && styles.chipSelecionado]}
                  >
                    <Text
                      style={[
                        styles.chipTexto,
                        selecionada && styles.chipTextoSelecionado,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma receita encontrada.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir receita ${item.titulo}`}
            onPress={() =>
              router.push({
                pathname: "/receita/[id]",
                params: { id: item.id },
              })
            }
            style={({ pressed }) => [
              styles.card,
              { width: larguraCard },
              pressed && styles.cardPressionado,
            ]}
          >
            <View style={[styles.foto, { backgroundColor: item.cor }]}>
              {item.imagem ? (
                <Image
                  source={item.imagem}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  accessibilityLabel={`Foto de ${item.titulo}`}
                />
              ) : null}
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitulo} numberOfLines={2}>
                {item.titulo}
              </Text>
              <Text style={styles.cardMeta}>
                {item.tempo} · {item.categoria}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#F7F8F5",
  },
  lista: {
    padding: 20,
  },
  cabecalho: {
    gap: 16,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1B1F1C",
  },
  subtitulo: {
    fontSize: 15,
    color: "#5C655E",
    marginTop: -12,
  },
  busca: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E1E5DE",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1B1F1C",
  },
  categorias: {
    gap: 8,
  },
  chip: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E1E5DE",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  chipSelecionado: {
    backgroundColor: "#2F7D4F",
    borderColor: "#2F7D4F",
  },
  chipTexto: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1B1F1C",
  },
  chipTextoSelecionado: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // NOVO: estilos da grade e dos cards
  linha: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E5DE",
    overflow: "hidden",
  },
  cardPressionado: {
    opacity: 0.85,
  },
  foto: {
    height: 120,
  },
  cardInfo: {
    padding: 12,
    gap: 6,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1B1F1C",
  },
  cardMeta: {
    fontSize: 13,
    color: "#5C655E",
  },
  vazio: {
    textAlign: "center",
    color: "#5C655E",
    fontSize: 15,
    marginTop: 24,
  },
});
