import type { FastifyInstance } from 'fastify';
import { generateProof } from '../circuit.js';
import { computeClue, packClue, wordToBytes, packWord } from '../wordle.js';
import { resolveCommitment } from '../derive.js';

interface CreateBody {
  tournamentId: number;
}

interface ProveBody {
  guess: string;
}

export async function tournamentRoutes(app: FastifyInstance) {
  /**
   * POST /tournament/create
   * Derive word + commitment for a given tournament ID.
   * The client predicts the next on-chain tournament ID and passes it here.
   */
  app.post<{ Body: CreateBody }>('/tournament/create', async (req, reply) => {
    const { tournamentId } = req.body;

    if (!tournamentId || !Number.isInteger(tournamentId) || tournamentId < 1) {
      return reply.code(400).send({ error: 'tournamentId must be a positive integer' });
    }

    const { commitment, derived } = await resolveCommitment(tournamentId);

    return {
      commitment,
      wordIndex: derived.wordIndex,
      solutionPacked: '0x' + packWord(derived.solution).toString(16),
    };
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

      if (isNaN(tournamentId) || tournamentId < 1) {
        return reply.code(400).send({ error: 'Invalid tournament ID' });
      }
      if (!guess || guess.length !== 5) {
        return reply.code(400).send({ error: 'Guess must be 5 letters' });
      }

      const { commitment, derived } = await resolveCommitment(tournamentId);
      const guessBytes = wordToBytes(guess.toLowerCase());

      // Compute clue
      const clue = computeClue(derived.solution, guessBytes);
      const cluePacked = packClue(clue);

      // Generate real ZK proof
      const result = await generateProof({
        solution: derived.solution,
        salt: derived.salt,
        commitment,
        guess: guessBytes,
        clue,
        cluePacked,
      });

      return {
        calldata: result.calldata,
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

      if (isNaN(tournamentId) || tournamentId < 1) {
        return reply.code(400).send({ error: 'Invalid tournament ID' });
      }

      const { derived } = await resolveCommitment(tournamentId);

      return {
        solution: derived.word,
        solutionIndex: derived.wordIndex,
        salt: derived.salt,
        solutionPacked: '0x' + packWord(derived.solution).toString(16),
      };
    },
  );
}
