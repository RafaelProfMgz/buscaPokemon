// Buscar os campos de texto
const inputPokemon = document.querySelector("#busca");
const inputHabilidade = document.querySelector("#busca-habilidade");

// Buscar o div onde os dados serão exibidos
const info = document.querySelector("#info");

// Função para atualizar o conteúdo do div info
const atualizarInfo = (conteudo) => {
  info.innerHTML = conteudo;
};

// Função para buscar e exibir informações do Pokémon
const buscarPokemon = async (nome) => {
  info.innerHTML = "";

  try {
    const resultado = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);
    if (resultado.ok) {
      const dados = await resultado.json();
      const pokemon = {
        nome: dados.name,
        imagem: dados.sprites.front_default,
        altura: dados.height / 10,
        peso: dados.weight / 10,
        tipos: dados.types.map((t) => t.type.name).join(", "),
        fraquezas: await obterFraquezas(dados.types),
        habilidades: dados.abilities.map((a) => a.ability.name).join(", "),
      };

      atualizarInfo(`
        <h1>${pokemon.nome.toUpperCase()}</h1>
        <img src="${pokemon.imagem}" alt="${pokemon.nome}">
        <p><strong>Altura:</strong> ${pokemon.altura} metros</p>
        <p><strong>Peso:</strong> ${pokemon.peso} kg</p>
        <p><strong>Tipos:</strong> ${pokemon.tipos}</p>
        <p><strong>Fraquezas:</strong> ${pokemon.fraquezas}</p>
        <p><strong>Habilidades:</strong> ${pokemon.habilidades}</p>
      `);
    } else {
      throw new Error("Pokémon não encontrado!");
    }
  } catch (error) {
    atualizarInfo(
      `<p style="color: red;"><strong>${error.message}</strong></p>`
    );
  }
};

// Função para obter fraquezas do Pokémon
const obterFraquezas = async (tipos) => {
  let fraquezas = [];
  for (let tipo of tipos) {
    const tipoResultado = await fetch(tipo.type.url);
    const tipoDados = await tipoResultado.json();
    const tipoFraquezas = tipoDados.damage_relations.double_damage_from.map(
      (weak) => weak.name
    );
    fraquezas.push(...tipoFraquezas);
  }
  return [...new Set(fraquezas)].join(", ");
};

// Função para buscar e exibir informações do movimento
const buscarHabilidade = async (habilidade) => {
  info.innerHTML = "";

  try {
    const resultado = await fetch(
      `https://pokeapi.co/api/v2/move/${habilidade}`
    );
    if (resultado.ok) {
      const dados = await resultado.json();
      const move = {
        nome: dados.name,
        tipo: dados.type.name,
        precisao: dados.accuracy,
        poder: dados.power,
        pp: dados.pp,
        descricao: dados.flavor_text_entries.find(
          (entry) => entry.language.name === "en"
        ).flavor_text,
        pokemon: await obterPokemonQueAprendem(dados.learned_by_pokemon),
      };

      atualizarInfo(`
        <h1>Habilidade: ${move.nome.toUpperCase()}</h1>
        <p><strong>Pokémon que aprendem essa habilidade:</strong></p>
        <img src="${move.pokemon.imagem}" alt="${move.pokemon.nome}" />
        <p>${move.pokemon.nome}</p>
        <p><strong>Tipo:</strong> ${move.tipo}</p>
        <p><strong>Precisão:</strong> ${move.precisao || "N/A"}</p>
        <p><strong>Poder:</strong> ${move.poder || "N/A"}</p>
        <p><strong>PP:</strong> ${move.pp}</p>
        <p><strong>Descrição:</strong> ${move.descricao}</p>
      `);
    } else {
      throw new Error("Habilidade não encontrada!");
    }
  } catch (error) {
    atualizarInfo(
      `<p style="color: red;"><strong>${error.message}</strong></p>`
    );
  }
};

// Função para obter o primeiro Pokémon que aprende o movimento
const obterPokemonQueAprendem = async (pokemonList) => {
  if (pokemonList.length > 0) {
    const pokemonResult = await fetch(pokemonList[0].url);
    const pokemonData = await pokemonResult.json();
    return {
      nome: pokemonData.name,
      imagem: pokemonData.sprites.front_default,
    };
  } else {
    return {
      nome: "Nenhum Pokémon encontrado",
      imagem: "",
    };
  }
};

// Event Listener para busca por Pokémon
inputPokemon.addEventListener("keypress", async (event) => {
  if (event.key === "Enter") {
    const nome = event.target.value.trim().toLowerCase();
    buscarPokemon(nome);
  }
});

// Event Listener para busca por habilidade
inputHabilidade.addEventListener("keypress", async (event) => {
  if (event.key === "Enter") {
    const habilidade = event.target.value.trim().toLowerCase();
    buscarHabilidade(habilidade);
  }
});
