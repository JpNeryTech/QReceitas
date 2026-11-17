import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ModalConfirmacaoProps = {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  destrutivo?: boolean;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export function ModalConfirmacao({
  visivel,
  titulo,
  mensagem,
  textoConfirmar,
  destrutivo = false,
  carregando = false,
  onConfirmar,
  onCancelar,
}: ModalConfirmacaoProps) {
  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={carregando ? undefined : onCancelar}
    >
      <View style={styles.fundo}>
        <View style={styles.cartao}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensagem}>{mensagem}</Text>
          <View style={styles.acoes}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              disabled={carregando}
              onPress={onCancelar}
              style={({ pressed }) => [
                styles.botao,
                styles.botaoCancelar,
                pressed && styles.pressionado,
              ]}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={textoConfirmar}
              disabled={carregando}
              onPress={onConfirmar}
              style={({ pressed }) => [
                styles.botao,
                destrutivo ? styles.botaoDestrutivo : styles.botaoConfirmar,
                (pressed || carregando) && styles.pressionado,
              ]}
            >
              {carregando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.textoConfirmar}>{textoConfirmar}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(27, 31, 28, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  cartao: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E5DE",
    padding: 20,
    gap: 12,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B1F1C",
  },
  mensagem: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5C655E",
  },
  acoes: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  botao: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoCancelar: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5DE",
  },
  botaoConfirmar: {
    backgroundColor: "#2F7D4F",
  },
  botaoDestrutivo: {
    backgroundColor: "#C44536",
  },
  textoCancelar: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1B1F1C",
  },
  textoConfirmar: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pressionado: {
    opacity: 0.85,
  },
});
