import React, { useState, useCallback, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContext } from '../../App';
import { useTournamentActions } from '../hooks/useTournamentActions';
import { colors, fontSize, fontWeight, spacing, radius, grid, fontFamily, gradients } from '../theme';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 54 : 36;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BOARD_MAX_WIDTH = 300;
const BOARD_WIDTH = Math.min(SCREEN_WIDTH - 48, BOARD_MAX_WIDTH);
const TILE_GAP = 6;
const TILE_SIZE = Math.floor((BOARD_WIDTH - TILE_GAP * (grid.cols - 1)) / grid.cols);

export type TileState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

export interface TileData {
  letter: string;
  state: TileState;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

const KEY_GAP = 4;
const KEY_WIDTH = Math.floor(
  (SCREEN_WIDTH - 16 - KEY_GAP * (KEYBOARD_ROWS[0].length - 1)) /
    KEYBOARD_ROWS[0].length
);
const KEY_HEIGHT = 46;

function getKeyboardStates(guesses: TileData[][]): Record<string, TileState> {
  const states: Record<string, TileState> = {};
  for (const row of guesses) {
    for (const tile of row) {
      const existing = states[tile.letter];
      if (tile.state === 'correct') {
        states[tile.letter] = 'correct';
      } else if (tile.state === 'present' && existing !== 'correct') {
        states[tile.letter] = 'present';
      } else if (!existing) {
        states[tile.letter] = tile.state;
      }
    }
  }
  return states;
}

const TILE_BG: Record<TileState, string> = {
  empty: colors.tile.empty,
  filled: colors.tile.empty,
  correct: colors.tile.correct,
  present: colors.tile.present,
  absent: colors.tile.absent,
};

const TILE_BORDER: Record<TileState, string> = {
  empty: colors.tile.border as string,
  filled: colors.tile.activeBorder as string,
  correct: colors.tile.correct as string,
  present: colors.tile.present as string,
  absent: 'transparent',
};

function Tile({ tile }: { tile: TileData }) {
  const isActive = tile.letter !== '' && tile.state === 'filled';
  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: TILE_BG[tile.state],
          borderColor: TILE_BORDER[tile.state],
          borderWidth: isActive ? 2 : 1,
        },
      ]}
    >
      {tile.letter !== '' && (
        <Text style={styles.tileLetter}>{tile.letter}</Text>
      )}
    </View>
  );
}

function KeyboardKey({
  letter,
  state,
  onPress,
}: {
  letter: string;
  state?: TileState;
  onPress: (key: string) => void;
}) {
  const isWide = letter === '⌫' || letter === 'ENTER';
  const hasState = state && state !== 'empty' && state !== 'filled';

  let keyBg: string = colors.tile.empty;
  let borderColor: string = colors.tile.border;
  let textColor: string = colors.text.primary;

  if (hasState) {
    if (state === 'correct') {
      keyBg = colors.tile.correct;
      borderColor = colors.tile.correct;
    } else if (state === 'present') {
      keyBg = colors.tile.present;
      borderColor = colors.tile.present;
      textColor = colors.bg.primary;
    } else {
      keyBg = 'rgba(12,141,138,0.15)';
      borderColor = 'rgba(12,141,138,0.1)';
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.key,
        { backgroundColor: keyBg, borderColor },
        isWide && styles.keyWide,
      ]}
      onPress={() => onPress(letter)}
      activeOpacity={0.6}
    >
      <Text
        style={[
          styles.keyText,
          { color: textColor },
          isWide && styles.keyTextWide,
        ]}
      >
        {letter}
      </Text>
    </TouchableOpacity>
  );
}

export function TournamentGameScreen() {
  const { goBack, params } = useContext(NavigationContext);
  const tournamentId: number = params?.tournamentId;
  const maxAttempts: number = params?.maxAttempts ?? 6;
  const { submitTournamentGuess, resumeTournament } = useTournamentActions();

  const [guesses, setGuesses] = useState<TileData[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProving, setIsProving] = useState(false);
  const [gameOver, setGameOver] = useState<'won' | 'lost' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [winAttempts, setWinAttempts] = useState(0);
  const [initializing, setInitializing] = useState(true);
  const currentRow = guesses.length;
  const keyStates = getKeyboardStates(guesses);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const state = await resumeTournament(tournamentId);
        if (!cancelled) {
          setGuesses(state.guesses);
          if (state.gameOver) setGameOver(state.gameOver);
        }
      } catch (err: any) {
        if (!cancelled) Alert.alert('Error', err.message);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [resumeTournament, tournamentId]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver || isLoading || isProving) return;
      if (key === '⌫') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (key === 'ENTER') {
        return;
      } else if (currentGuess.length < grid.cols) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, gameOver, isLoading, isProving],
  );

  const handleSubmit = useCallback(async () => {
    if (currentGuess.length !== grid.cols || isLoading || isProving || gameOver) return;
    setIsProving(true);
    try {
      const result = await submitTournamentGuess(
        tournamentId,
        currentGuess,
        guesses.length,
        maxAttempts,
      );
      const submittedRow: TileData[] = currentGuess.split('').map((letter, i) => ({
        letter,
        state: result.tileStates[i] || 'absent',
      }));
      setGuesses((prev) => [...prev, submittedRow]);
      setCurrentGuess('');

      if (result.isWin) {
        setGameOver('won');
        setWinAttempts(result.attemptNumber);
        setTimeout(() => setShowModal(true), 400);
      } else if (result.isLoss) {
        setGameOver('lost');
        setTimeout(() => setShowModal(true), 400);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsProving(false);
    }
  }, [currentGuess, isLoading, isProving, gameOver, guesses.length, submitTournamentGuess, tournamentId, maxAttempts]);

  if (initializing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={{ color: colors.text.primary, marginTop: spacing.md, fontSize: fontSize.sm }}>
          Loading tournament...
        </Text>
      </View>
    );
  }

  // Build board
  const board: TileData[][] = [];
  for (let r = 0; r < maxAttempts; r++) {
    if (r < guesses.length) {
      board.push(guesses[r]);
    } else if (r === currentRow) {
      const row: TileData[] = [];
      for (let c = 0; c < grid.cols; c++) {
        row.push({
          letter: currentGuess[c] || '',
          state: currentGuess[c] ? 'filled' : 'empty',
        });
      }
      board.push(row);
    } else {
      board.push(
        Array.from({ length: grid.cols }, (): TileData => ({ letter: '', state: 'empty' })),
      );
    }
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tournament #{tournamentId}</Text>
          <View style={styles.backBtn} />
        </View>
        <Text style={styles.subtitleText}>ZK-VERIFIED MODE</Text>
      </View>

      {/* Proving indicator */}
      {isProving && (
        <View style={styles.provingBanner}>
          <ActivityIndicator size="small" color={colors.bg.primary} />
          <Text style={styles.provingText}>Generating ZK proof...</Text>
        </View>
      )}

      {/* Board */}
      <View style={styles.boardWrapper}>
        {guesses.length === 0 && currentGuess.length === 0 && (
          <Text style={styles.promptText}>MAKE YOUR FIRST GUESS!</Text>
        )}
        <View style={styles.boardContainer}>
          {board.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.tileRow}>
              {row.map((tile, colIdx) => (
                <Tile key={`${rowIdx}-${colIdx}`} tile={tile} />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Keyboard */}
      <View style={styles.keyboard}>
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.keyboardRow}>
            {row.map((key) => (
              <KeyboardKey
                key={key}
                letter={key}
                state={keyStates[key]}
                onPress={key === 'ENTER' ? () => handleSubmit() : handleKeyPress}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Bottom spacer */}
      <View style={styles.bottomSpacer} />

      {/* Win / Loss Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <LinearGradient
              colors={[...gradients.gold]}
              style={styles.modalBanner}
            >
              <Text style={styles.modalBannerText}>
                {gameOver === 'won' ? "YOU WON!" : 'TRY AGAIN'}
              </Text>
            </LinearGradient>

            {guesses.length > 0 && (
              <View style={styles.modalTileRow}>
                {guesses[guesses.length - 1].map((tile, i) => (
                  <View
                    key={i}
                    style={[
                      styles.modalTile,
                      { backgroundColor: TILE_BG[tile.state] },
                    ]}
                  >
                    <Text style={styles.modalTileLetter}>{tile.letter}</Text>
                  </View>
                ))}
              </View>
            )}

            {gameOver === 'won' && (
              <Text style={styles.modalPoints}>
                Solved in {winAttempts} attempt{winAttempts !== 1 ? 's' : ''}!
              </Text>
            )}

            <Text style={styles.modalSubtitle}>
              {gameOver === 'won'
                ? 'Your ZK-verified result is on-chain!'
                : 'Better luck in the next tournament!'}
            </Text>

            <TouchableOpacity
              style={styles.modalBtnPrimary}
              activeOpacity={0.8}
              onPress={goBack}
            >
              <Text style={styles.modalBtnPrimaryText}>Back to Tournaments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: spacing.xs,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.brand.primary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: fontSize.base,
    fontFamily: fontFamily.heading,
    textAlign: 'center',
  },
  subtitleText: {
    color: colors.brand.primary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bodySemiBold,
    textAlign: 'center',
    letterSpacing: 2,
  },

  // ── Proving Banner ──
  provingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.sm,
  },
  provingText: {
    color: colors.bg.primary,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodySemiBold,
  },

  // ── Board ──
  boardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    color: colors.text.muted,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodySemiBold,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  boardContainer: {
    width: BOARD_WIDTH,
    gap: TILE_GAP,
  },
  tileRow: {
    flexDirection: 'row',
    gap: TILE_GAP,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  tileLetter: {
    color: colors.text.onTile,
    fontSize: Math.round(TILE_SIZE * 0.45),
    fontFamily: fontFamily.display,
  },

  // ── Keyboard ──
  keyboard: {
    paddingHorizontal: 8,
    gap: KEY_GAP,
    paddingBottom: 4,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: KEY_GAP,
  },
  key: {
    width: KEY_WIDTH,
    height: KEY_HEIGHT,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  keyWide: {
    width: KEY_WIDTH * 1.5,
  },
  keyText: {
    fontSize: 15,
    fontFamily: fontFamily.bodyBold,
  },
  keyTextWide: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
  },

  bottomSpacer: {
    height: Platform.OS === 'ios' ? spacing['2xl'] : spacing['3xl'],
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.bg.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.tile.border,
  },
  modalClose: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  modalBanner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  modalBannerText: {
    color: colors.text.primary,
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.display,
    letterSpacing: 2,
    textAlign: 'center',
  },
  modalTileRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  modalTile: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTileLetter: {
    color: colors.text.onTile,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.display,
  },
  modalPoints: {
    color: colors.brand.primary,
    fontSize: fontSize.xl,
    fontFamily: fontFamily.heading,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.base,
    marginBottom: spacing['2xl'],
    textAlign: 'center',
  },
  modalBtnPrimary: {
    width: '100%',
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  modalBtnPrimaryText: {
    color: colors.bg.primary,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bodySemiBold,
  },
});
