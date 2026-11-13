import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NovaReceita() {
  return (
    <SafeAreaView style={styles.tela} edges={["top", "left", "right"]}>
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Nova receita</Text>
        <Text style={styles.subtitulo}>
          Cadastre um prato para a sua lista.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#F7F8F5",
  },
  conteudo: {
    padding: 20,
    gap: 16,
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
});
