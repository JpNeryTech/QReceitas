import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputFocusEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  adicionarReceita,
  atualizarReceita,
  buscarReceitaFirebase,
} from "../../services/receitaService";
import { enviarImagemCloudinary } from "../../services/cloudinaryService";
import { ModalConfirmacao } from "../../components/modal-confirmacao";


const CATEGORIAS = ["Sobremesas", "Massas", "Saladas", "Lanches", "Prato feito"];
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

function extrairMinutos(tempo: string) {
  const minutos = tempo.match(/(\d+)\s*min/i);
  if (minutos) return minutos[1];
  const numero = tempo.match(/\d+/);
  return numero ? numero[0] : "";
}

function mostrarMensagem(titulo: string, mensagem: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.alert(`${titulo}\n\n${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
}

export default function NovaReceita() {
  const { id: idParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const receitaId = Array.isArray(idParam) ? idParam[0] : idParam;
  const editando = Boolean(receitaId);

  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [fotoSalva, setFotoSalva] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregandoEdicao, setCarregandoEdicao] = useState(editando);
  const [confirmarAberto, setConfirmarAberto] = useState(false);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  function subirCampo(evento: TextInputFocusEvent) {
    if (typeof evento.target !== "number") return;

    scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(
      evento.target,
      180,
      true,
    );
  }
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

  function limparFormulario() {
    setFoto(null);
    setFotoSalva(null);
    setTitulo("");
    setCategoria(CATEGORIAS[0]);
    setTempo("");
    setPorcoes("");
    setIngredientes([
      novoIngrediente(),
      novoIngrediente(),
      novoIngrediente(),
    ]);
    setPassos([novoPasso(), novoPasso()]);
  }

  useEffect(() => {
    if (!receitaId) {
      limparFormulario();
      return;
    }

    let ativo = true;
    setCarregandoEdicao(true);

    async function carregarReceita() {
      try {
        const receita = await buscarReceitaFirebase(receitaId as string);
        if (!ativo) return;

        if (!receita) {
          mostrarMensagem(
            "Receita não encontrada",
            "Não foi possível abrir essa receita para edição.",
          );
          if (router.canGoBack()) router.back();
          return;
        }

        setTitulo(receita.titulo);
        setCategoria(
          CATEGORIAS.includes(receita.categoria)
            ? receita.categoria
            : CATEGORIAS[0],
        );
        setTempo(extrairMinutos(receita.tempo));
        setPorcoes(String(receita.porcoes));
        setFoto(null);
        setFotoSalva(typeof receita.imagem === "string" ? receita.imagem : null);
        setIngredientes(
          receita.ingredientes?.length
            ? receita.ingredientes.map((ingrediente) => ({
                id: gerarId(),
                nome: ingrediente.nome,
                quantidade: ingrediente.quantidade,
              }))
            : [novoIngrediente()],
        );
        setPassos(
          receita.passos?.length
            ? receita.passos.map((texto) => ({ id: gerarId(), texto }))
            : [novoPasso()],
        );
      } catch (erro) {
        console.error("Erro ao carregar receita para edição:", erro);
        if (!ativo) return;
        mostrarMensagem(
          "Erro ao carregar",
          "Não foi possível abrir a receita. Verifique sua conexão e as regras do Firestore.",
        );
        if (router.canGoBack()) router.back();
      } finally {
        if (ativo) setCarregandoEdicao(false);
      }
    }

    void carregarReceita();

    return () => {
      ativo = false;
    };
  }, [receitaId]);

  async function escolherFoto() {
    if (salvando) return;

    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // reduz o tamanho da imagem
    });

    if (resultado.canceled || !resultado.assets.length) return;

    const imagem = resultado.assets[0];

    // Validação de tamanho no front
    if (imagem.fileSize && imagem.fileSize > TAMANHO_MAXIMO) {
      mostrarMensagem("Foto muito grande", "Escolha uma imagem de até 5 MB.");
      return;
    }

    setFoto(imagem);
    } catch (erro) {
      console.error("Erro ao escolher imagem:", erro);
      mostrarMensagem("Erro", "Não foi possível selecionar a imagem.");
    }
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

  function formularioValido() {
    if (!titulo.trim()) {
      mostrarMensagem("Falta o título", "Dê um nome para a receita.");
      return false;
    }
    if (!ingredientes.some((ing) => ing.nome.trim() !== "")) {
      mostrarMensagem("Faltam ingredientes", "Adicione pelo menos um ingrediente.");
      return false;
    }
    if (!passos.some((passo) => passo.texto.trim() !== "")) {
      mostrarMensagem("Falta o modo de preparo", "Escreva pelo menos um passo.");
      return false;
    }

    const tempoNumero = Number(tempo);
    const porcoesNumero = Number(porcoes);
    if (!Number.isInteger(tempoNumero) || tempoNumero <= 0) {
      mostrarMensagem("Tempo inválido", "Informe o tempo em minutos.");
      return false;
    }
    if (!Number.isInteger(porcoesNumero) || porcoesNumero <= 0) {
      mostrarMensagem("Porções inválidas", "Informe uma quantidade válida.");
      return false;
    }

    return true;
  }

  function pedirConfirmacao() {
    if (salvando) return;
    if (!formularioValido()) return;
    setConfirmarAberto(true);
  }

  // Valida os campos, envia a foto e publica a receita.
  async function salvarReceita() {
    if (salvando) return;

    const ingredientesPreenchidos = ingredientes
      .filter((ing) => ing.nome.trim() !== "")
      .map(({ nome, quantidade }) => ({
        nome: nome.trim(),
        quantidade: quantidade.trim(),
      }));
    const passosPreenchidos = passos
      .filter((passo) => passo.texto.trim() !== "")
      .map((passo) => passo.texto.trim());

    if (!ingredientesPreenchidos.length || !passosPreenchidos.length) {
      return;
    }

    const tempoNumero = Number(tempo);
    const porcoesNumero = Number(porcoes);
    if (
      !Number.isInteger(tempoNumero) ||
      tempoNumero <= 0 ||
      !Number.isInteger(porcoesNumero) ||
      porcoesNumero <= 0
    ) {
      return;
    }

    setConfirmarAberto(false);
    setSalvando(true);
    try {
      // Foto nova sobe para o Cloudinary. Na edição, a URL já salva permanece.
      const imagemUrl = foto
        ? await enviarImagemCloudinary(foto)
        : (fotoSalva ?? undefined);

      const cores: Record<string, string> = {
        Sobremesas: "#F3E3C8",
        Massas: "#F0D9D2",
        Saladas: "#E2ECD8",
        Lanches: "#EFE6BF",
        "Prato feito": "#F6D5C2",
      };

      const receita = {
        titulo: titulo.trim(),
        tempo: `${tempoNumero} min`,
        porcoes: porcoesNumero,
        categoria,
        cor: cores[categoria] ?? "#E2ECD8",
        ingredientes: ingredientesPreenchidos,
        passos: passosPreenchidos,
        ...(imagemUrl ? { imagem: imagemUrl } : {}),
      };

      if (editando && receitaId) {
        await atualizarReceita(receitaId, receita);
        router.navigate({
          pathname: "/receita/[id]",
          params: { id: receitaId },
        });
        return;
      }

      const nome = receita.titulo;
      await adicionarReceita(receita);
      limparFormulario();
      router.navigate("/");
      mostrarMensagem("Receita publicada!", `${nome} foi salva com sucesso.`);
    } catch (erro) {
      console.error("Erro ao cadastrar receita:", erro);
      mostrarMensagem(
        "Erro ao salvar",
        erro instanceof Error ? erro.message : "Não foi possível cadastrar a receita."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregandoEdicao) {
    return (
      <SafeAreaView style={styles.carregando} edges={["top"]}>
        <ActivityIndicator size="large" color="#2F7D4F" />
      </SafeAreaView>
    );
  }

  const uriPreview = foto?.uri ?? fotoSalva;

  return (
    <SafeAreaView style={styles.tela} edges={["top"]}>
      <KeyboardAvoidingView style={styles.teclado} behavior="padding">
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Text style={styles.titulo}>
          {editando ? "Editar receita" : "Nova receita"}
        </Text>

        {/* Foto com pré-visualização */}
        <Pressable style={styles.fotoBotao} onPress={escolherFoto} disabled={salvando}>
          {uriPreview ? (
            <>
              <Image source={{ uri: uriPreview }} style={styles.fotoImagem} />
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
            onFocus={subirCampo}
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
                  disabled={salvando}
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
              onFocus={subirCampo}
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
              onFocus={subirCampo}
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
                onFocus={subirCampo}
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
                onFocus={subirCampo}
                onChangeText={(texto) =>
                  atualizarIngrediente(ing.id, "quantidade", texto)
                }
              />
              <Pressable
                style={styles.remover}
                onPress={() => removerIngrediente(ing.id)}
                disabled={salvando}
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
                onFocus={subirCampo}
                onChangeText={(texto) => atualizarPasso(passo.id, texto)}
                editable={!salvando}
              />
              <Pressable
                style={styles.remover}
                onPress={() => removerPasso(passo.id)}
                disabled={salvando}
                accessibilityLabel={`Remover passo ${indice + 1}`}
              >
                <Ionicons name="trash-outline" size={22} color="#5C655E" />
              </Pressable>
            </View>
          ))}

          <Pressable style={styles.botaoSecundario} onPress={adicionarPasso} disabled={salvando}>
            <Ionicons name="add" size={18} color="#2F7D4F" />
            <Text style={styles.botaoSecundarioTexto}>Adicionar passo</Text>
          </Pressable>
        </View>

        {/* NOVO: botão salvar */}
        <Pressable
          style={[styles.botaoSalvar, salvando && styles.botaoDesativado]}
          onPress={pedirConfirmacao}
          disabled={salvando}
        >
          {salvando && <ActivityIndicator size="small" color="#FFFFFF" />}
          <Text style={styles.botaoSalvarTexto}>
            {salvando
              ? "Salvando..."
              : editando
                ? "Salvar alterações"
                : "Salvar receita"}
          </Text>
        </Pressable>
      </ScrollView>
      </KeyboardAvoidingView>
      <ModalConfirmacao
        visivel={confirmarAberto}
        titulo={editando ? "Salvar alterações" : "Publicar receita"}
        mensagem={
          editando
            ? `Deseja salvar as alterações em "${titulo.trim()}"?`
            : `Deseja publicar "${titulo.trim()}"?`
        }
        textoConfirmar={editando ? "Salvar" : "Publicar"}
        carregando={salvando}
        onCancelar={() => setConfirmarAberto(false)}
        onConfirmar={() => {
          void salvarReceita();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#F7F8F5",
  },
  teclado: {
    flex: 1,
  },
  carregando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    gap: 10,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#2F7D4F",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoDesativado: {
    opacity: 0.6,
  },
  botaoSalvarTexto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
