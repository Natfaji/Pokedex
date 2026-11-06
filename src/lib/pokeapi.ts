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

export type PokemonNameResult = {
  name: string;
  url: string;
};

const POKEMON_INDEX_CACHE_TIME = 24 * 60 * 60 * 1000;
let pokemonIndexCache: PokemonNameResult[] | null = null;
let pokemonIndexFetchedAt = 0;
let pokemonIndexRequest: Promise<PokemonNameResult[]> | null = null;

export type PokemonStat = {
  name: string;
  value: number;
};

export type PokemonDetails = PokemonSummary & {
  abilities: string[];
  stats: PokemonStat[];
  evolutions: PokemonSummary[];
};

export type PokemonListPage = {
  pokemon: PokemonSummary[];
  nextOffset: number | null;
};

type NamedApiResource = {
  name: string;
  url: string;
};

type PokemonListResponse = {
  count: number;
  next: string | null;
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
  const match = url.match(/\/(?:pokemon|pokemon-species)\/(\d+)\/?$/);
  if (!match) throw new PokeApiError(`Unable to determine id from ${url}`);
  return Number(match[1]);
}

function getImageUrl(id: number, sprites: PokemonApiResponse['sprites']) {
  return (
    sprites.other?.['official-artwork']?.front_default ??
    sprites.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
  );
}

function getResourceId(resource: NamedApiResource) {
  return getIdFromUrl(resource.url);
}

function toSummaryResource(resource: NamedApiResource): PokemonSummary {
  const id = getResourceId(resource);
  return {
    id,
    name: resource.name,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    types: [],
  };
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

function flattenEvolutionChain(node: EvolutionNode): NamedApiResource[] {
  return [node.species, ...node.evolves_to.flatMap(flattenEvolutionChain)];
}

export async function getPokemonList(limit = 24, offset = 0): Promise<PokemonSummary[]> {
  const list = await request<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
  return list.results.map(toSummaryResource);
}

export async function getPokemonListPage(
  limit = 24,
  offset = 0,
): Promise<PokemonListPage> {
  const list = await request<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`,
  );
  return {
    pokemon: list.results.map(toSummaryResource),
    nextOffset: list.next ? offset + limit : null,
  };
}

export async function getPokemonTypes(): Promise<PokemonTypeSummary[]> {
  const list = await request<PokemonTypeListResponse>('/type?limit=100');
  return list.results.map(({ name }) => ({ name }));
}

export async function getPokemonByType(type: string): Promise<PokemonSummary[]> {
  const response = await request<PokemonTypeResponse>(
    `/type/${encodeURIComponent(type)}`,
  );
  return response.pokemon.map(({ pokemon }) => toSummaryResource(pokemon));
}

export async function searchPokemon(query: string): Promise<PokemonSummary[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return getPokemonList();
  }

  const resources = (await getPokemonNameIndex())
    .filter(({ name }) => name.includes(normalizedQuery))
    .slice(0, 40);
  return resources.map(toSummaryResource);
}

export async function searchPokemonNames(
  query: string,
): Promise<PokemonNameResult[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 3) {
    return [];
  }

  const list = await getPokemonNameIndex();
  return list
    .filter(({ name }) => name.includes(normalizedQuery))
    .slice(0, 40)
}

export async function getPokemonNameIndex(): Promise<PokemonNameResult[]> {
  if (
    pokemonIndexCache &&
    Date.now() - pokemonIndexFetchedAt < POKEMON_INDEX_CACHE_TIME
  ) {
    return pokemonIndexCache;
  }

  if (!pokemonIndexRequest) {
    pokemonIndexRequest = request<PokemonListResponse>('/pokemon?limit=2000')
      .then((list) => {
        pokemonIndexCache = list.results.map(({ name, url }) => ({ name, url }));
        pokemonIndexFetchedAt = Date.now();
        return pokemonIndexCache;
      })
      .finally(() => {
        pokemonIndexRequest = null;
      });
  }

  return pokemonIndexRequest;
}

export async function getPokemonDetails(name: string): Promise<PokemonDetails> {
  const pokemon = await request<PokemonApiResponse>(`/pokemon/${encodeURIComponent(name)}`);
  const species = await request<{ evolution_chain: NamedApiResource }>(
    pokemon.species.url.replace(API_BASE_URL, ''),
  );
  const evolutionChain = await request<EvolutionChainResponse>(
    species.evolution_chain.url.replace(API_BASE_URL, ''),
  );
  const current = toSummary(pokemon);
  const evolutions = await Promise.all(
    flattenEvolutionChain(evolutionChain.chain).map((s) =>
      s.name === pokemon.species.name ? current : getSummary(s),
    ),
  );

  return {
    ...current,
    abilities: pokemon.abilities.map(({ ability }) => ability.name),
    stats: pokemon.stats.map(({ base_stat, stat }) => ({ name: stat.name, value: base_stat })),
    evolutions,
  };
}

export function getPokemonIdFromResource(resource: NamedApiResource) {
  return getIdFromUrl(resource.url);
}
