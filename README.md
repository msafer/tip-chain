# Tip Chain 💰

A decentralized tipping platform built on Farcaster frames, enabling seamless cryptocurrency tips across Base and Optimism networks.

## Features

- **Farcaster Integration**: Native frame support for in-app tipping
- **Multi-Chain Support**: Tips on Base and Optimism networks
- **Multiple Tokens**: Support for ETH, USDC, and other popular tokens
- **Real-time Leaderboards**: Track top tippers and recipients
- **Wallet Integration**: Connect with popular Ethereum wallets
- **Rate Limiting**: Built-in protection against spam and abuse
- **Analytics**: Comprehensive tipping statistics and insights

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Blockchain**: Wagmi, Viem, RainbowKit
- **Database**: PostgreSQL with Prisma
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/msafer/tip-chain.git
   cd tip-chain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tipchain"

# Farcaster
FARCASTER_HUB_URL="https://hub-api.farcaster.xyz:2281"
FARCASTER_APP_FID="your-app-fid"
FARCASTER_APP_PRIVATE_KEY="your-app-private-key"

# Blockchain
RPC_URL_BASE="https://mainnet.base.org"
RPC_URL_OPTIMISM="https://mainnet.optimism.io"

# Rate Limiting
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

## API Routes

### Frames API

- `GET /api/frame` - Main frame endpoint
- `POST /api/frame` - Handle frame interactions
- `GET /api/frame/image` - Generate dynamic frame images
- `POST /api/frame/prepare-tip` - Prepare tip transactions

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ for the Farcaster ecosystem
