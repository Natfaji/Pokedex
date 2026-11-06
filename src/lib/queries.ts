import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  getBattlePokemon,
  getPokemonByType,
  getPokemonDetails,
  getPokemonListPage,
  getPokemonTypes,
  getTypeDamageRelations,
  searchPokemon
} from '@/lib/pokeapi';

export function usePokemonList() {
  return useInfiniteQuery({
    queryKey: ['pokemon-list'],
    queryFn: ({ pageParam }) => getPokemonListPage(24, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
}

export function usePokemonNameSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const result = useQuery({
    queryKey: ['pokemon-search', debouncedQuery],
    queryFn: () => searchPokemon(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 3,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const matches = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    if (normalizedQuery.length < 3 || !result.data) {
      return [];
    }
    return result.data
      .filter(({ name }) => name.includes(normalizedQuery))
      .slice(0, 40);
  }, [debouncedQuery, result.data]);

  return { ...result, data: matches };
}

export function usePokemonDetails(name: string) {
  return useQuery({
    queryKey: ['pokemon-details', name],
    queryFn: () => getPokemonDetails(name),
    enabled: name.length > 0,
  });
}

export function usePokemonTypes() {
  return useQuery({
    queryKey: ['pokemon-types'],
    queryFn: getPokemonTypes,
  });
}

export function usePokemonByType(type: string) {
  return useQuery({
    queryKey: ['pokemon-by-type', type],
    queryFn: () => getPokemonByType(type),
    enabled: type.length > 0,
  });
}

export function useBattlePokemon(name: string) {
  return useQuery({
    queryKey: ['battle-pokemon', name],
    queryFn: () => getBattlePokemon(name),
    enabled: name.length > 0,
  });
}

export function useBattleTypeRelations(types: string[]) {
  return useQuery({
    queryKey: ['battle-type-relations', ...types],
    queryFn: async () => {
      const relations = await Promise.all(types.map(getTypeDamageRelations));
      return Object.fromEntries(
        relations.map((relation) => [
          relation.attacking,
          {
            doubleDamageTo: relation.doubleDamageTo,
            halfDamageTo: relation.halfDamageTo,
            noDamageTo: relation.noDamageTo,
          },
        ]),
      );
    },
    enabled: types.length > 0,
  });
}