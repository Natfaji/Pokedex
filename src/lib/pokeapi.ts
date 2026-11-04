const API_BASE_URL = 'https://pokeapi.co/api/v2';

export type PokemonType = {
  name: string;
};

export type PokemonTypeSummary = {
  name: string;
};

export type PokemonSummary = {
  id: number;
  name: string;
  image: string;
  types: PokemonType[];
};

export type PokemonStat = {
  name: string;
  value: number;
};

export type PokemonDetails = PokemonSummary & {
  abilities: string[];
  stats: PokemonStat[];
  evolutions: PokemonSummary[];
};

type NamedApiResource = {
  name: string;
  url: string;
};

type PokemonListResponse = {
  results: NamedApiResource[];
};

type PokemonApiResponse = {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      ['official-artwork']?: {
        front_default: string | null;
      };
    };
  };
  types: { type: NamedApiResource }[];
  abilities: { ability: NamedApiResource }[];
  stats: { base_stat: number; stat: NamedApiResource }[];
  species: NamedApiResource;
};

type EvolutionNode = {
  species: NamedApiResource;
  evolves_to: EvolutionNode[];
};

type EvolutionChainResponse = {
  chain: EvolutionNode;
};

type PokemonTypeResponse = {
  pokemon: { pokemon: NamedApiResource }[];
};

type PokemonTypeListResponse = {
  results: NamedApiResource[];
};

export class PokeApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PokeApiError';
  }
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new PokeApiError(`PokeAPI request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function getIdFromUrl(url: string) {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  if (!match) {
    throw new PokeApiError(`Unable to determine Pokemon id from ${url}`);
  }
  return Number(match[1]);
}

function getImageUrl(id: number, sprites: PokemonApiResponse['sprites']) {
  return (
    sprites.other?.['official-artwork']?.front_default ??
    sprites.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
  );
}

function toSummary(pokemon: PokemonApiResponse): PokemonSummary {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: getImageUrl(pokemon.id, pokemon.sprites),
    types: pokemon.types.map(({ type }) => ({ name: type.name })),
  };
}

async function getSummary(resource: NamedApiResource): Promise<PokemonSummary> {
  return toSummary(await request<PokemonApiResponse>(`/pokemon/${resource.name}`));
}

function flattenEvolutionChain(node: EvolutionNode): string[] {
  return [node.species.name, ...node.evolves_to.flatMap(flattenEvolutionChain)];
}

export async function getPokemonList(limit = 24, offset = 0): Promise<PokemonSummary[]> {
  const list = await request<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
  return Promise.all(list.results.map(getSummary));
}

export async function getPokemonTypes(): Promise<PokemonTypeSummary[]> {
  const list = await request<PokemonTypeListResponse>('/type?limit=100');
  return list.results.map(({ name }) => ({ name }));
}

export async function getPokemonByType(type: string): Promise<PokemonSummary[]> {
  const response = await request<PokemonTypeResponse>(
    `/type/${encodeURIComponent(type)}`,
  );
  return Promise.all(response.pokemon.map(({ pokemon }) => getSummary(pokemon)));
}

export async function searchPokemon(query: string): Promise<PokemonSummary[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return getPokemonList();
  }

  const [nameMatches, typeMatches] = await Promise.all([
    request<PokemonListResponse>('/pokemon?limit=2000').then((list) =>
      list.results.filter(({ name }) => name.includes(normalizedQuery)).slice(0, 40),
    ),
    request<PokemonTypeResponse>(`/type/${encodeURIComponent(normalizedQuery)}`).then(
      (response) => response.pokemon.map(({ pokemon }) => pokemon).slice(0, 40),
      () => [],
    ),
  ]);

  const resources = [...nameMatches, ...typeMatches].filter(
    (resource, index, all) => all.findIndex(({ name }) => name === resource.name) === index,
  );
  return Promise.all(resources.map(getSummary));
}

export async function getPokemonDetails(name: string): Promise<PokemonDetails> {
  const pokemon = await request<PokemonApiResponse>(`/pokemon/${encodeURIComponent(name)}`);
  const species = await request<{ evolution_chain: NamedApiResource }>(
    `/pokemon-species/${encodeURIComponent(name)}`,
  );
  const evolutionChain = await request<EvolutionChainResponse>(
    species.evolution_chain.url.replace(API_BASE_URL, ''),
  );
  const evolutionNames = flattenEvolutionChain(evolutionChain.chain);
  const evolutions = await Promise.all(
    evolutionNames.filter((evolutionName) => evolutionName !== pokemon.name).map((evolutionName) =>
      getSummary({ name: evolutionName, url: `${API_BASE_URL}/pokemon/${evolutionName}` }),
    ),
  );

  return {
    ...toSummary(pokemon),
    abilities: pokemon.abilities.map(({ ability }) => ability.name),
    stats: pokemon.stats.map(({ base_stat, stat }) => ({ name: stat.name, value: base_stat })),
    evolutions: [toSummary(pokemon), ...evolutions],
  };
}

export function getPokemonIdFromResource(resource: NamedApiResource) {
  return getIdFromUrl(resource.url);
}
