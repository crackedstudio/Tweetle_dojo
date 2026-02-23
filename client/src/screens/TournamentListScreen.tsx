import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NavigationContext } from '../../App';
import { useTournamentActions } from '../hooks/useTournamentActions';
import type { TournamentNode } from '../dojo/apollo';
import { colors, fontSize, spacing, radius, fontFamily, fontWeight } from '../theme';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 54 : 36;

// Tournament status enum matching the contract
const STATUS_LABELS: Record<number, string> = {
  0: 'Pending',
  1: 'Active',
  2: 'Completed',
  3: 'Cancelled',
};

const STATUS_COLORS: Record<number, string> = {
  0: colors.tile.present,
  1: colors.brand.primary,
  2: colors.tile.correct,
  3: colors.tile.absent,
};

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr || '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function TournamentCard({
  tournament,
  onJoin,
  onPlay,
}: {
  tournament: TournamentNode;
  onJoin: () => void;
  onPlay: () => void;
}) {
  const status = Number(tournament.status);
  const isJoinable = status === 0 || status === 1;
  const isPlayable = status === 1;
  const statusColor = STATUS_COLORS[status] ?? colors.text.muted;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Tournament #{tournament.tournament_id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '33' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABELS[status] ?? 'Unknown'}
          </Text>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.cardStat}>
          <Text style={styles.cardStatLabel}>Players</Text>
          <Text style={styles.cardStatValue}>
            {tournament.current_players}/{tournament.max_players}
          </Text>
        </View>
        <View style={styles.cardStat}>
          <Text style={styles.cardStatLabel}>Attempts</Text>
          <Text style={styles.cardStatValue}>6</Text>
        </View>
        <View style={styles.cardStat}>
          <Text style={styles.cardStatLabel}>Creator</Text>
          <Text style={styles.cardStatValue}>{truncateAddress(tournament.creator)}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        {isJoinable && (
          <TouchableOpacity style={styles.joinBtn} onPress={onJoin} activeOpacity={0.8}>
            <Text style={styles.joinBtnText}>JOIN</Text>
          </TouchableOpacity>
        )}
        {isPlayable && (
          <TouchableOpacity style={styles.playBtn} onPress={onPlay} activeOpacity={0.8}>
            <Text style={styles.playBtnText}>PLAY</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function TournamentListScreen() {
  const { navigate, goBack } = useContext(NavigationContext);
  const { listTournaments, joinTournament } = useTournamentActions();
  const [tournaments, setTournaments] = useState<TournamentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  const loadTournaments = useCallback(async () => {
    try {
      const list = await listTournaments();
      setTournaments(list);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }, [listTournaments]);

  useEffect(() => {
    loadTournaments().finally(() => setLoading(false));
  }, [loadTournaments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTournaments();
    setRefreshing(false);
  }, [loadTournaments]);

  const handleJoin = useCallback(
    async (tournamentId: string) => {
      setJoining(tournamentId);
      try {
        await joinTournament(Number(tournamentId));
        Alert.alert('Joined!', `You joined tournament #${tournamentId}`);
        await loadTournaments();
      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        setJoining(null);
      }
    },
    [joinTournament, loadTournaments],
  );

  const handlePlay = useCallback(
    (tournament: TournamentNode) => {
      navigate('tournament-game' as any, {
        tournamentId: Number(tournament.tournament_id),
        maxAttempts: 6,
      });
    },
    [navigate],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tournaments</Text>
          <View style={styles.backBtn} />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading tournaments...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand.primary}
            />
          }
        >
          {tournaments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyTitle}>No Tournaments Yet</Text>
              <Text style={styles.emptyDesc}>
                Tournaments will appear here once they are created by the game master.
              </Text>
            </View>
          ) : (
            tournaments.map((t) => (
              <TournamentCard
                key={t.tournament_id}
                tournament={t}
                onJoin={() => handleJoin(t.tournament_id)}
                onPlay={() => handlePlay(t)}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    paddingTop: STATUS_BAR_HEIGHT,
  },
  header: {
    backgroundColor: colors.bg.surface,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 60,
    height: 36,
    justifyContent: 'center',
  },
  backText: {
    color: colors.brand.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.heading,
    textAlign: 'center',
  },
  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },

  // ── Card ──
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.tile.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.heading,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bodySemiBold,
  },
  cardStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardStat: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  cardStatLabel: {
    color: colors.text.muted,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  cardStatValue: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodySemiBold,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  joinBtn: {
    flex: 1,
    backgroundColor: colors.bg.surfaceLight,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  joinBtnText: {
    color: colors.brand.primary,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodySemiBold,
    letterSpacing: 1,
  },
  playBtn: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  playBtnText: {
    color: colors.bg.primary,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodySemiBold,
    letterSpacing: 1,
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontFamily: fontFamily.heading,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
  },
});
