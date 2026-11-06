import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";

import { BattleCard, type AttackPopupData } from "@/components/battle-card";
import {
  BattleHeader,
  BattleLog,
  BattleOutcome,
  MoveSelector,
} from "@/components/battle-fight-controls";
import { StateView } from "@/components/battle-state-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import {
  calculateDamage,
  calculateMaxHp,
  orderSides,
  type BattleSide,
} from "@/lib/battle-engine";
import { useBattlePokemon, useBattleTypeRelations } from "@/lib/queries";
import { addBattleHistory } from "@/services/battle-history-db";

export default function BattleFightScreen() {
  const { player = "", opponent = "" } = useLocalSearchParams<{
    player: string;
    opponent: string;
  }>();
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const playerQuery = useBattlePokemon(player);
  const opponentQuery = useBattlePokemon(opponent);
  const playerPokemon = playerQuery.data;
  const opponentPokemon = opponentQuery.data;
  const moveTypes = useMemo(
    () =>
      [...(playerPokemon?.moves ?? []), ...(opponentPokemon?.moves ?? [])].map(
        ({ type }) => type,
      ),
    [playerPokemon, opponentPokemon],
  );
  const relationsQuery = useBattleTypeRelations([...new Set(moveTypes)]);
  const [playerHpState, setPlayerHp] = useState<number | null>(null);
  const [opponentHpState, setOpponentHp] = useState<number | null>(null);
  const [turn, setTurn] = useState(0);
  const [winner, setWinner] = useState<BattleSide | null>(null);
  const [resolving, setResolving] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [playerDamageVersion, setPlayerDamageVersion] = useState(0);
  const [opponentDamageVersion, setOpponentDamageVersion] = useState(0);
  const [popup, setPopup] = useState<AttackPopupData | null>(null);
  const [saveError, setSaveError] = useState(false);
  const saved = useRef(false);

  useEffect(() => {
    if (!winner || !playerPokemon || !opponentPokemon || saved.current) return;
    saved.current = true;
    void addBattleHistory({
      player: playerPokemon,
      opponent: opponentPokemon,
      winner,
      turns: turn,
    })
      .then(() =>
        queryClient.invalidateQueries({ queryKey: ["battle-history"] }),
      )
      .catch(() => setSaveError(true));
  }, [opponentPokemon, playerPokemon, queryClient, turn, winner]);

  if (
    playerQuery.isLoading ||
    opponentQuery.isLoading ||
    relationsQuery.isLoading ||
    !playerPokemon ||
    !opponentPokemon
  ) {
    return <StateView message={t("battleLoading")} />;
  }
  if (playerQuery.isError || opponentQuery.isError || relationsQuery.isError) {
    return (
      <StateView
        message={t("error")}
        action={t("tryAgain")}
        onAction={() => {
          void playerQuery.refetch();
          void opponentQuery.refetch();
          void relationsQuery.refetch();
        }}
      />
    );
  }
  const relations = relationsQuery.data ?? {};
  const playerHp = playerHpState ?? calculateMaxHp(playerPokemon);
  const opponentHp = opponentHpState ?? calculateMaxHp(opponentPokemon);

  const effectivenessMessages: Record<string, string> = {
    super: t("battleSuperEffective"),
    notVery: t("battleNotVeryEffective"),
    none: t("battleNoEffect"),
  };

  const playTurn = async (moveIndex: number) => {
    if (resolving || winner) return;

    setResolving(true);

    const playerMove = playerPokemon.moves[moveIndex] ?? playerPokemon.moves[0];
    const opponentMove =
      opponentPokemon.moves[randomIndex(opponentPokemon.moves.length)];
    const actions = orderSides(
      playerPokemon,
      opponentPokemon,
      randomUnit(),
    ).map((side) => ({
      side,
      move: side === "player" ? playerMove : opponentMove,
    }));

    let nextPlayerHp = playerHp;
    let nextOpponentHp = opponentHp;

    for (const action of actions) {
      if (nextPlayerHp <= 0 || nextOpponentHp <= 0) break;
      if (action.side === "opponent") {
        await wait(650);
      }

      const attacker =
        action.side === "player" ? playerPokemon : opponentPokemon;
      const defender =
        action.side === "player" ? opponentPokemon : playerPokemon;
      const result = calculateDamage(
        attacker,
        defender,
        action.move,
        relations,
      );

      if (!result.hit) {
        setPopup({
          side: action.side === "player" ? "opponent" : "player",
          text: t("battleMiss"),
          kind: "miss",
        });

        setLog((current) => [
          `(${getSideLabel(action.side, t)}) ${attacker.name} ${t("battleMissed")} ${action.move.name}.`,
          ...current,
        ]);

        await wait(550);
        setPopup(null);
        continue;
      }

      if (action.side === "player") {
        nextOpponentHp = Math.max(0, nextOpponentHp - result.damage);
        setOpponentDamageVersion((current) => current + 1);
      } else {
        nextPlayerHp = Math.max(0, nextPlayerHp - result.damage);
        setPlayerDamageVersion((current) => current + 1);
      }

      setPopup({
        side: action.side === "player" ? "opponent" : "player",
        text: `-${result.damage}`,
        kind: "damage",
      });

      setPlayerHp(nextPlayerHp);
      setOpponentHp(nextOpponentHp);

      const effectivenessText =
        effectivenessMessages[result.effectiveness] ?? "";

      setLog((current) => [
        `(${getSideLabel(action.side, t)}) ${attacker.name} ${t("battleUsed")} ${action.move.name}: ${result.damage} ${t("battleDamage")}${effectivenessText ? ` (${effectivenessText})` : ""}.`,
        ...current,
      ]);
      await wait(550);
      setPopup(null);
    }

    const nextWinner =
      nextPlayerHp <= 0 ? "opponent" : nextOpponentHp <= 0 ? "player" : null;
    if (nextWinner) {
      setLog((current) => [
        `${t("battleWinner")}: ${getSideLabel(nextWinner, t)} ${nextWinner === "player" ? playerPokemon.name : opponentPokemon.name}.`,
        ...current,
      ]);
    }
    setTurn((current) => current + 1);
    setWinner(nextWinner);
    setResolving(false);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <BattleHeader
          onNewBattle={() => router.push({ pathname: "/battle" })}
        />
        <BattleCard
          pokemon={opponentPokemon}
          hp={opponentHp}
          damageVersion={opponentDamageVersion}
          popup={popup?.side === "opponent" ? popup : null}
        />
        <ThemedText style={styles.vs}>VS</ThemedText>
        <BattleCard
          pokemon={playerPokemon}
          hp={playerHp}
          damageVersion={playerDamageVersion}
          popup={popup?.side === "player" ? popup : null}
        />
        {winner && (
          <BattleOutcome winner={winner} turns={turn} saveError={saveError} />
        )}
        {!winner && (
          <MoveSelector
            moves={playerPokemon.moves}
            disabled={resolving}
            onSelect={(index) => void playTurn(index)}
          />
        )}
        <BattleLog entries={log} />
      </ScrollView>
    </ThemedView>
  );
}

function getSideLabel(side: BattleSide, translate: (key: string) => string) {
  return side === "player"
    ? translate("battlePlayerLabel")
    : translate("battleOpponentLabel");
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  vs: {
    alignSelf: "center",
    fontWeight: "900",
    color: Palette.accent,
    fontSize: 20,
  },
  moves: { gap: Spacing.two },
  move: {
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: Palette.accent,
  },
  moveName: { color: Palette.white, fontWeight: "800", fontSize: 17 },
  moveMeta: { color: "#DCE8FF" },
  log: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 14,
  },
  winner: {
    alignItems: "center",
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: 16,
  },
  winnerWon: { backgroundColor: "#16A34A" },
  winnerLost: { backgroundColor: "#DC2626" },
  winnerText: { color: Palette.white, fontWeight: "800" },
  disabled: { opacity: 0.45 },
});

function randomUnit() {
  return Math.random();
}

function randomIndex(length: number) {
  return Math.floor(randomUnit() * length);
}
