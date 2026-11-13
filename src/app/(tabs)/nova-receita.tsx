import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIAS = ["Sobremesas", "Massas", "Saladas", "Lanches"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB

type Ingrediente = { id: string; nome: string; quantidade: string };
type Passo = { id: string; texto: string }; // NOVO

// NOVO: gera um id único para cada linha
function gerarId() {
  return `${Date.now()}-${Math.random()}`;
}

function novoIngrediente(): Ingrediente {
  return { id: gerarId(), nome: "", quantidade: "" };
}

// NOVO: cria um passo vazio
function novoPasso(): Passo {
  return { id: gerarId(), texto: "" };
}

export default function NovaReceita() {
  const [foto, setFoto] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [tempo, setTempo] = useState("");
  const [porcoes, setPorcoes] = useState("");

  const [ingredientes, setIngredientes] = useState<Ingrediente[]>(() => [
    novoIngrediente(),
    novoIngrediente(),
    novoIngrediente(),
  ]);

  // NOVO: lista de passos (começa com 2)
  const [passos, setPassos] = useState<Passo[]>(() => [
    novoPasso(),
    novoPasso(),
  ]);

  async function escolherFoto() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // reduz o tamanho da imagem
    });

    if (resultado.canceled) return;

    const imagem = resultado.assets[0];

    // Validação de tamanho no front
    if (imagem.fileSize && imagem.fileSize > TAMANHO_MAXIMO) {
      Alert.alert("Foto muito grande", "Escolha uma imagem de até 5 MB.");
      return;
    }

    setFoto(imagem.uri);
  }

  function atualizarIngrediente(
    id: string,
    campo: "nome" | "quantidade",
    valor: string,
  ) {
    setIngredientes((lista) =>
      lista.map((ing) => (ing.id === id ? { ...ing, [campo]: valor } : ing)),
    );
  }

  function adicionarIngrediente() {
    setIngredientes((lista) => [...lista, novoIngrediente()]);
  }

  function removerIngrediente(id: string) {
    setIngredientes((lista) =>
      lista.length > 1 ? lista.filter((ing) => ing.id !== id) : lista,
    );
  }

  // NOVO: atualiza o texto de um passo
  function atualizarPasso(id: string, texto: string) {
    setPassos((lista) =>
      lista.map((passo) => (passo.id === id ? { ...passo, texto } : passo)),
    );
  }

  // NOVO: adiciona um passo no final
  function adicionarPasso() {
    setPassos((lista) => [...lista, novoPasso()]);
  }

  // NOVO: remove um passo (sempre fica pelo menos um)
  function removerPasso(id: string) {
    setPassos((lista) =>
      lista.length > 1 ? lista.filter((passo) => passo.id !== id) : lista,
    );
  }

  // NOVO: valida e monta o objeto da receita
  function salvarReceita() {
    const ingredientesPreenchidos = ingredientes.filter(
      (ing) => ing.nome.trim() !== "",
    );
    const passosPreenchidos = passos.filter(
      (passo) => passo.texto.trim() !== "",
    );

    if (titulo.trim() === "") {
      Alert.alert("Falta o título", "Dê um nome para a receita.");
      return;
    }
    if (ingredientesPreenchidos.length === 0) {
      Alert.alert("Faltam ingredientes", "Adicione pelo menos um ingrediente.");
      return;
    }
    if (passosPreenchidos.length === 0) {
      Alert.alert("Falta o modo de preparo", "Escreva pelo menos um passo.");
      return;
    }

    // Mesmo formato que vai para o Firestore
    const receita = {
      titulo: titulo.trim(),
      categoria,
      tempoPreparoMin: Number(tempo) || 0,
      porcoes: Number(porcoes) || 0,
      ingredientes: ingredientesPreenchidos.map(({ nome, quantidade }) => ({
        nome: nome.trim(),
        quantidade: quantidade.trim(),
      })),
      passos: passosPreenchidos.map((passo) => passo.texto.trim()),
      fotoUri: foto, // depois vira fotoUrl, quando subirmos a foto para o Storage
    };

    console.log("Receita pronta para salvar:", receita);
    Alert.alert(
      "Receita pronta!",
      "Os dados estão no formato certo. Falta ligar ao Firebase.",
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Text style={styles.titulo}>Nova receita</Text>

        {/* Foto com pré-visualização */}
        <Pressable style={styles.fotoBotao} onPress={escolherFoto}>
          {foto ? (
            <>
              <Image source={{ uri: foto }} style={styles.fotoImagem} />
              <View style={styles.fotoTrocar}>
                <Text style={styles.fotoTrocarTexto}>Trocar foto</Text>
              </View>
            </>
          ) : (
            <View style={styles.fotoVazia}>
              <Text style={styles.fotoVaziaTitulo}>
                Escolher foto da receita
              </Text>
              <Text style={styles.fotoVaziaDica}>
                JPG, PNG ou WebP · até 5 MB
              </Text>
            </View>
          )}
        </Pressable>

        <View style={styles.campo}>
          <Text style={styles.rotulo}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Bolo de cenoura"
            placeholderTextColor="#5C655E"
            value={titulo}
            onChangeText={setTitulo}
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.rotulo}>Categoria</Text>
          <View style={styles.categorias}>
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
          </View>
        </View>

        <View style={styles.linha}>
          <View style={[styles.campo, styles.metade]}>
            <Text style={styles.rotulo}>Tempo (min)</Text>
            <TextInput
              style={styles.input}
              placeholder="50"
              placeholderTextColor="#5C655E"
              keyboardType="numeric"
              value={tempo}
              onChangeText={setTempo}
            />
          </View>
          <View style={[styles.campo, styles.metade]}>
            <Text style={styles.rotulo}>Porções</Text>
            <TextInput
              style={styles.input}
              placeholder="8"
              placeholderTextColor="#5C655E"
              keyboardType="numeric"
              value={porcoes}
              onChangeText={setPorcoes}
            />
          </View>
        </View>

        {/* Ingredientes */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Ingredientes</Text>

          {ingredientes.map((ing, indice) => (
            <View key={ing.id} style={styles.ingredienteLinha}>
              <TextInput
                style={[styles.input, styles.ingredienteNome]}
                placeholder="Ingrediente"
                placeholderTextColor="#5C655E"
                accessibilityLabel={`Nome do ingrediente ${indice + 1}`}
                value={ing.nome}
                onChangeText={(texto) =>
                  atualizarIngrediente(ing.id, "nome", texto)
                }
              />
              <TextInput
                style={[styles.input, styles.ingredienteQtd]}
                placeholder="Qtd."
                placeholderTextColor="#5C655E"
                accessibilityLabel={`Quantidade do ingrediente ${indice + 1}`}
                value={ing.quantidade}
                onChangeText={(texto) =>
                  atualizarIngrediente(ing.id, "quantidade", texto)
                }
              />
              <Pressable
                style={styles.remover}
                onPress={() => removerIngrediente(ing.id)}
                accessibilityLabel={`Remover ingrediente ${indice + 1}`}
              >
                <Ionicons name="trash-outline" size={22} color="#5C655E" />
              </Pressable>
            </View>
          ))}

          <Pressable
            style={styles.botaoSecundario}
            onPress={adicionarIngrediente}
          >
            <Ionicons name="add" size={18} color="#2F7D4F" />
            <Text style={styles.botaoSecundarioTexto}>
              Adicionar ingrediente
            </Text>
          </Pressable>
        </View>

        {/* NOVO: modo de preparo */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Modo de preparo</Text>

          {passos.map((passo, indice) => (
            <View key={passo.id} style={styles.passoLinha}>
              <View style={styles.passoNumero}>
                <Text style={styles.passoNumeroTexto}>{indice + 1}</Text>
              </View>
              <TextInput
                style={styles.passoInput}
                placeholder="Descreva o passo"
                placeholderTextColor="#5C655E"
                accessibilityLabel={`Passo ${indice + 1}`}
                multiline
                textAlignVertical="top"
                value={passo.texto}
                onChangeText={(texto) => atualizarPasso(passo.id, texto)}
              />
              <Pressable
                style={styles.remover}
                onPress={() => removerPasso(passo.id)}
                accessibilityLabel={`Remover passo ${indice + 1}`}
              >
                <Ionicons name="trash-outline" size={22} color="#5C655E" />
              </Pressable>
            </View>
          ))}

          <Pressable style={styles.botaoSecundario} onPress={adicionarPasso}>
            <Ionicons name="add" size={18} color="#2F7D4F" />
            <Text style={styles.botaoSecundarioTexto}>Adicionar passo</Text>
          </Pressable>
        </View>

        {/* NOVO: botão salvar */}
        <Pressable style={styles.botaoSalvar} onPress={salvarReceita}>
          <Text style={styles.botaoSalvarTexto}>Salvar receita</Text>
        </Pressable>
      </ScrollView>
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
    paddingBottom: 40,
    gap: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1B1F1C",
  },
  fotoBotao: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#B9C2BA",
    backgroundColor: "#FFFFFF",
  },
  fotoVazia: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  fotoVaziaTitulo: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1B1F1C",
  },
  fotoVaziaDica: {
    fontSize: 13,
    color: "#5C655E",
  },
  fotoImagem: {
    width: "100%",
    height: "100%",
  },
  fotoTrocar: {
    position: "absolute",
    right: 12,
    bottom: 12,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  fotoTrocarTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1B1F1C",
  },
  campo: {
    gap: 6,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B1F1C",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E1E5DE",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1B1F1C",
  },
  categorias: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  linha: {
    flexDirection: "row",
    gap: 12,
  },
  metade: {
    flex: 1,
  },
  secao: {
    gap: 10,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B1F1C",
  },
  ingredienteLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ingredienteNome: {
    flex: 1,
  },
  ingredienteQtd: {
    width: 104,
  },
  remover: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoSecundario: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#2F7D4F",
    borderRadius: 12,
  },
  botaoSecundarioTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2F7D4F",
  },
  // NOVO: estilos dos passos e do botão salvar
  passoLinha: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  passoNumero: {
    width: 28,
    height: 28,
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: "#E4EFE7",
    alignItems: "center",
    justifyContent: "center",
  },
  passoNumeroTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F5A38",
  },
  passoInput: {
    flex: 1,
    height: 80,
    borderWidth: 1,
    borderColor: "#E1E5DE",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 15,
    color: "#1B1F1C",
  },
  botaoSalvar: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#2F7D4F",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoSalvarTexto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
