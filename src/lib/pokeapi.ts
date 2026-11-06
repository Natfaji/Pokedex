import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://pokeapi.co/api/v2';
const API_CACHE_PREFIX = 'pokedex:api-cache:';

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

export type PokemonStat = {
  name: string;
  value: number;
};

export type PokemonDetails = PokemonSummary & {
  abilities: string[];
  stats: PokemonStat[];
  evolutions: PokemonSummary[];
};

export type BattleMove = {
  name: string;
  power: number | null;
  type: string;
  accuracy: number | null;
  damageClass: 'physical' | 'special' | 'status';
};

export type BattlePokemon = PokemonSummary & {
  level: 50;
  stats: Record<'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed', number>;
  moves: BattleMove[];
};

export type TypeDamageRelations = {
  attacking: string;
  doubleDamageTo: string[];
  halfDamageTo: string[];
  noDamageTo: string[];
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
  moves: { move: NamedApiResource }[];
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

type MoveApiResponse = {
  name: string;
  power: number | null;
  accuracy: number | null;
  damage_class: NamedApiResource;
  type: NamedApiResource;
};

type TypeDamageRelationsResponse = {
  name: string;
  damage_relations: {
    double_damage_to: NamedApiResource[];
    half_damage_to: NamedApiResource[];
    no_damage_to: NamedApiResource[];
  };
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
  const cacheKey = `${API_CACHE_PREFIX}${path}`;
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) {
      throw new PokeApiError(`PokeAPI request failed with status ${response.status}`);
    }
    const data = (await response.json()) as T;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (error) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    throw error;
  }
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

async function getSummaries(resources: NamedApiResource[]) {
  return Promise.all(resources.map(getSummary));
}

function flattenEvolutionChain(node: EvolutionNode): NamedApiResource[] {
  return [node.species, ...node.evolves_to.flatMap(flattenEvolutionChain)];
}

async function getPokemon(name: string): Promise<PokemonApiResponse> {
  return request<PokemonApiResponse>(
    `/pokemon/${encodeURIComponent(name)}`,
  );
}

export async function getPokemonList(limit = 24, offset = 0): Promise<PokemonSummary[]> {
  const list = await request<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
  return getSummaries(list.results);
}

export async function getPokemonListPage(
  limit = 24,
  offset = 0,
): Promise<PokemonListPage> {
  const list = await request<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`,
  );
  return {
    pokemon: await getSummaries(list.results),
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
  return getSummaries(response.pokemon.map(({ pokemon }) => pokemon));
}

export async function searchPokemon(query: string): Promise<PokemonSummary[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return getPokemonList();
  }

  const resources = (await getPokemonNameIndex())
    .filter(({ name }) => name.includes(normalizedQuery))
    .slice(0, 40);
  return getSummaries(resources);
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
  const list = await request<PokemonListResponse>('/pokemon?limit=2000');

  return list.results.map(({ name, url }) => ({ name, url }));
}

export async function getPokemonDetails(name: string): Promise<PokemonDetails> {
  const pokemon = await getPokemon(name);
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

export async function getBattlePokemon(name: string): Promise<BattlePokemon> {
  const pokemon = await getPokemon(name);
  const moves = await Promise.all(
    pokemon.moves.slice(0, 4).map(async ({ move }) => {
      const details = await request<MoveApiResponse>(
        move.url.replace(API_BASE_URL, ''),
      );
      return {
        name: details.name,
        power: details.power,
        type: details.type.name,
        accuracy: details.accuracy,
        damageClass:
          details.damage_class.name === 'physical' ||
            details.damage_class.name === 'special'
            ? details.damage_class.name
            : 'status',
      } satisfies BattleMove;
    }),
  );
  const stats = Object.fromEntries(
    pokemon.stats
      .filter(({ stat }) =>
        ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].includes(
          stat.name,
        ),
      )
      .map(({ stat, base_stat }) => [stat.name, base_stat]),
  ) as BattlePokemon['stats'];

  return {
    ...toSummary(pokemon),
    level: 50,
    stats,
    moves:
      moves.length > 0
        ? moves.map((move) =>
          move.power === null
            ? {
              name: 'struggle',
              power: 50,
              type: 'normal',
              accuracy: null,
              damageClass: 'physical',
            }
            : move,
        )
        : [
          {
            name: 'struggle',
            power: 50,
            type: 'normal',
            accuracy: null,
            damageClass: 'physical',
          },
        ],
  };
}

export async function getTypeDamageRelations(
  type: string,
): Promise<TypeDamageRelations> {
  const response = await request<TypeDamageRelationsResponse>(
    `/type/${encodeURIComponent(type)}`,
  );
  return {
    attacking: response.name,
    doubleDamageTo: response.damage_relations.double_damage_to.map(({ name }) => name),
    halfDamageTo: response.damage_relations.half_damage_to.map(({ name }) => name),
    noDamageTo: response.damage_relations.no_damage_to.map(({ name }) => name),
  };
}

export function getPokemonIdFromResource(resource: NamedApiResource) {
  return getIdFromUrl(resource.url);
}
