import Fastify from 'fastify';
import cors from '@fastify/cors';
import { tournamentRoutes } from './routes/tournament.js';

const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      },
    },
  });

  await app.register(cors, { origin: true });
  await app.register(tournamentRoutes);

  app.get('/health', async () => ({ status: 'ok' }));

  await app.listen({ port: PORT, host: HOST });
  console.log(`Tweetle prover server running on http://${HOST}:${PORT}`);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
