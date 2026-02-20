import type { FastifyInstance } from 'fastify';
import { computeCommitment, generateProof } from '../circuit.js';
import { computeClue, packClue, wordToBytes, packWord } from '../wordle.js';
import { WORDS, WORD_COUNT } from '../words.js';
import { storeTournament, getTournament } from '../db.js';

interface CreateBody {
  wordIndex?: number; // Optional: use a specific word. If omitted, random.
}

interface ProveBody {
  guess: string; // 5-letter word
}

export async function tournamentRoutes(app: FastifyInstance) {
  /**
   * POST /tournament/create
   * Pick a word, compute commitment, return commitment + salt for on-chain tx.
   * The client/game-master then calls create_tournament() on-chain with the commitment.
   */
  app.post<{ Body: CreateBody }>('/tournament/create', async (req, reply) => {
    const wordIndex =
      req.body.wordIndex ?? Math.floor(Math.random() * WORD_COUNT);

    if (wordIndex < 0 || wordIndex >= WORD_COUNT) {
      return reply.code(400).send({ error: 'Invalid word index' });
    }

    const word = WORDS[wordIndex];
    const solution = wordToBytes(word);

    // Generate random salt (as a decimal string Field)
    const saltBig = BigInt(
      '0x' +
        Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(''),
    );
    const salt = saltBig.toString();

    // Compute commitment using the helper circuit
    const commitment = await computeCommitment(solution, salt);

    return {
      commitment,
      salt,
      wordIndex,
      solutionPacked: '0x' + packWord(solution).toString(16),
    };
  });

  /**
   * POST /tournament/:id/register
   * After on-chain create_tournament succeeds, register the tournament in our DB.
   */
  app.post<{
    Params: { id: string };
    Body: { salt: string; wordIndex: number; commitment: string };
  }>('/tournament/:id/register', async (req, reply) => {
    const tournamentId = parseInt(req.params.id);
    const { salt, wordIndex, commitment } = req.body;

    if (isNaN(tournamentId) || wordIndex < 0 || wordIndex >= WORD_COUNT) {
      return reply.code(400).send({ error: 'Invalid parameters' });
    }

    const word = WORDS[wordIndex];
    storeTournament(tournamentId, word, salt, wordIndex, commitment);

    return { ok: true, tournamentId };
  });

  /**
   * POST /tournament/:id/prove
   * Accept a guess, compute clue, generate ZK proof + calldata.
   */
  app.post<{ Params: { id: string }; Body: ProveBody }>(
    '/tournament/:id/prove',
    async (req, reply) => {
      const tournamentId = parseInt(req.params.id);
      const { guess } = req.body;

      if (!guess || guess.length !== 5) {
        return reply.code(400).send({ error: 'Guess must be 5 letters' });
      }

      const tournament = getTournament(tournamentId);
      if (!tournament) {
        return reply.code(404).send({ error: 'Tournament not found' });
      }

      const solution = wordToBytes(tournament.solution);
      const guessBytes = wordToBytes(guess.toLowerCase());

      // Compute clue
      const clue = computeClue(solution, guessBytes);
      const cluePacked = packClue(clue);

      // Generate ZK proof
      const { calldata } = await generateProof({
        solution,
        salt: tournament.salt,
        commitment: tournament.commitment,
        guess: guessBytes,
        clue,
        cluePacked,
      });

      return {
        calldata,
        clue,
        cluePacked,
        guess: guess.toLowerCase(),
      };
    },
  );

  /**
   * GET /tournament/:id/reveal
   * Return the solution for a completed tournament (for end_tournament tx).
   */
  app.get<{ Params: { id: string } }>(
    '/tournament/:id/reveal',
    async (req, reply) => {
      const tournamentId = parseInt(req.params.id);
      const tournament = getTournament(tournamentId);
      if (!tournament) {
        return reply.code(404).send({ error: 'Tournament not found' });
      }

      return {
        solution: tournament.solution,
        solutionIndex: tournament.word_index,
        salt: tournament.salt,
        solutionPacked: '0x' + packWord(wordToBytes(tournament.solution)).toString(16),
      };
    },
  );
}
