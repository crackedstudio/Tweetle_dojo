# Tweetle

A fully on-chain competitive word puzzle game built on Starknet using the Dojo engine. Players guess a hidden 5-letter word within six attempts. Tournament mode uses zero-knowledge proofs to verify every guess without revealing the solution.

## Game Modes

**Classic** — Free-play word challenges with on-chain scoring and leaderboards.

**Daily** — A new word every day. Track your streak and compete for the top daily score.

**Tournament** — Stake an entry fee, compete against other players on the same hidden word. ZK proofs guarantee fair play. Top performers split the prize pool (50/25/15/10%).

## How ZK Tournaments Work

1. A secret word is committed on-chain as a Poseidon2 hash — no one can see it
2. Player submits a guess → the prover server evaluates it and generates a Noir ZK proof
3. The proof (~2900 felt252 calldata) is verified on-chain by a Garaga verifier contract
4. The contract extracts public inputs, confirms the commitment matches, and stores the result
5. The solution stays hidden until the tournament creator ends it

The server never stores the secret word — it derives it deterministically from a master secret using HMAC-SHA256, making the backend fully stateless.

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web Client │────▶│  Prover Server   │     │    Starknet     │
│   (React)    │     │  (Node/Fastify)  │     │   (Dojo World)  │
│              │     │                  │     │                 │
│  - Game UI   │     │  - Derive word   │     │  - Game state   │
│  - Keyboard  │     │  - Compute clue  │     │  - Tournaments  │
│  - Board     │     │  - Generate ZK   │     │  - Scoring      │
│              │     │    proof (Noir)   │     │  - Leaderboard  │
│              │────▶│                  │     │                 │
│              │     └──────────────────┘     │  Garaga Verifier│
│              │──────────────────────────────▶│  (ZK on-chain)  │
└──────────────┘                              └─────────────────┘
        │                                            ▲
        │            ┌──────────────────┐            │
        └───────────▶│  Torii Indexer   │────────────┘
                     │  (GraphQL/gRPC)  │
                     └──────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Cairo / Dojo |
| ZK Circuits | Noir (Ultra Keccak ZK Honk) |
| On-Chain Verifier | Garaga v1.0.1 |
| Indexer | Torii (GraphQL + gRPC) |
| Wallet | Cartridge Controller (session keys) |
| Frontend | React + Vite + TailwindCSS |
| Prover Server | Node.js / Fastify on Railway |

## Project Structure

```
tweetle_dojo/
├── contracts/        # Cairo smart contracts (Dojo)
│   └── src/
│       ├── models/   # Game state, tournament, config models
│       └── systems/  # Actions, daily game, tournament manager
├── circuits/         # Noir ZK circuits
│   ├── tweetle_wordle/       # Main proof circuit (guess verification)
│   └── tweetle_commitment/   # Commitment computation helper
├── server/           # Prover server (Fastify)
│   └── src/
│       ├── derive.ts         # Stateless word derivation (HMAC)
│       ├── circuit.ts        # Noir/bb/Garaga proof pipeline
│       ├── wordle.ts         # Clue computation logic
│       └── routes/           # API endpoints
├── web/              # React frontend
│   └── src/
│       ├── pages/            # Game, tournament, admin pages
│       ├── hooks/            # Dojo + tournament action hooks
│       └── providers/        # Wallet, Dojo context providers
└── Dockerfile.server # Production Docker (nargo + bb + garaga)
```

## Live Deployment

- **Web**: [tweetle-dojo.vercel.app](https://tweetle-dojo.vercel.app)
- **Prover Server**: Railway (Dockerized with full ZK toolchain)
- **Network**: Starknet Sepolia

## Running Locally

**Contracts:**
```bash
cd contracts
sozo build
sozo migrate
```

**Prover Server:**
```bash
cd server
pnpm install
MASTER_SECRET=your-secret-here pnpm dev
```
Requires `nargo`, `bb`, and `garaga` on PATH.

**Web:**
```bash
cd web
pnpm install
pnpm dev
```

## Deployed Contracts (Starknet Sepolia)

| Contract | Address |
|----------|---------|
| World | `0x45b2841cbd334ae7cb39c89fdea585341b4b7688e215076aede41fc354c3f8d` |
| Actions | `0x97b632e93243e3c8fa31ea94580ae1e54f8338015c811b6413455cdeb319b8` |
| Daily Game | `0x6b4d457983ca94b1c7ecda18411a01e5c1cbdd96cd4e92b46fd984df9751300` |
| Tournament Manager | `0x5efad73bc9c5401383fd9c0fb76b2db60356f1c4fcc9fed60f29fa8cd7dc236` |
| Player System | `0x143fb2cfabb7277a1b8696284f0ca6327698d2db74097fe7967cc13975dd239` |
| Garaga ZK Verifier | `0x00dd86587a5fac0f1cfddf76e768d6110deeca70357f8827d7b0635aa94eb582` |

## Links

- **Live App**: [tweetle-dojo.vercel.app](https://tweetle-dojo.vercel.app)
- **Prover Server**: `https://tweetledojo-production.up.railway.app`
- **Torii Indexer**: `https://api.cartridge.gg/x/tweetle-dojo/torii`
- **RPC**: `https://api.cartridge.gg/x/starknet/sepolia`
- **GitHub**: [github.com/crackedstudio/Tweetle_dojo](https://github.com/crackedstudio/Tweetle_dojo)

## Team

Built by [Cracked Studio](https://github.com/crackedstudio)
