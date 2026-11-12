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
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIAS = ["Todas", "Sobremesas", "Massas", "Saladas", "Lanches"];

// NOVO: dados de exemplo (depois vão vir do Firebase)
const RECEITAS = [
  {
    id: "1",
    titulo: "Bolo de cenoura",
    tempo: "50 min",
    categoria: "Sobremesas",
    cor: "#F3E3C8",
  },
  {
    id: "2",
    titulo: "Lasanha",
    tempo: "1 h 20",
    categoria: "Massas",
    cor: "#F0D9D2",
  },
  {
    id: "3",
    titulo: "Salada Caesar",
    tempo: "20 min",
    categoria: "Saladas",
    cor: "#E2ECD8",
  },
  {
    id: "4",
    titulo: "Brigadeiro",
    tempo: "30 min",
    categoria: "Sobremesas",
    cor: "#E6DDEE",
  },
  {
    id: "5",
    titulo: "Pão de queijo",
    tempo: "45 min",
    categoria: "Lanches",
    cor: "#EFE6BF",
  },
  {
    id: "6",
    titulo: "Macarrão alho e óleo",
    tempo: "25 min",
    categoria: "Massas",
    cor: "#DDE7EC",
  },
];

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
          <View style={[styles.card, { width: larguraCard }]}>
            <View style={[styles.foto, { backgroundColor: item.cor }]} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitulo} numberOfLines={2}>
                {item.titulo}
              </Text>
              <Text style={styles.cardMeta}>
                {item.tempo} · {item.categoria}
              </Text>
            </View>
          </View>
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
