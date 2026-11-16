# 🍲 QReceitas

Aplicativo mobile para **cadastrar receitas próprias** e **consultar receitas já cadastradas**, com busca simples e visualização completa de ingredientes e modo de preparo.

---

## ✨ Funcionalidades

- Cadastrar novas receitas (nome, ingredientes, modo de preparo, tempo, porções e categoria)
- Listar todas as receitas cadastradas
- Consultar os detalhes de uma receita
- Buscar receitas por nome ou ingrediente
- Editar e excluir receitas


## 📁 Estrutura do projeto

```
QReceitas/
├── assets/          # Imagens, ícones e fontes
├── src/             # Código-fonte do app (telas, componentes, serviços)
├── app.json         # Configuração do Expo
├── package.json     # Dependências e scripts
├── tsconfig.json    # Configuração do TypeScript
├── LICENSE
└── README.md
```

## 🚀 Como executar

### Pré-requisitos

- [Git](https://git-scm.com/)
- App **Expo Go** no celular (ou um emulador Android/iOS)

### Passo a passo

```bash
# 1. Clone o repositório
git clone [URL-DO-REPOSITORIO]

# 2. Entre na pasta do projeto
cd QReceitas

# 3. Instale as dependências
npm install

# 4. Inicie o projeto
npx expo start
```

Depois, escaneie o QR Code com o Expo Go ou pressione `a` (Android) / `i` (iOS) para abrir no emulador.

## 📖 Como usar

1. Na tela inicial, veja a lista de receitas cadastradas.
2. Use a busca para encontrar uma receita por nome ou ingrediente.
3. Toque em uma receita para ver ingredientes e modo de preparo.
4. Use o botão de adicionar para cadastrar a sua própria receita.

## 🧾 Modelo de uma receita

```ts
type Receita = {
  id: string;
  nome: string;
  categoria: string;
  tempoPreparo: string;
  porcoes: number;
  ingredientes: string[];
  modoPreparo: string;
};
```

## 🗺️ Melhorias futuras

- [ ] Foto da receita
- [ ] Filtro por categoria e tempo de preparo
- [ ] Favoritar receitas
- [ ] Compartilhar receitas

## 👨‍💻 Autor

**Ericson Nascimento **
**Joao Pedro Nery **
**Guilherme França fernandes **
**Gabriella Rocha R. **
**Artur Tome **

## 📄 Licença

Este projeto está sob a licença descrita no arquivo [LICENSE](./LICENSE).