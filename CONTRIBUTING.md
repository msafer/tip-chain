# Contributing to Tip Chain

We love your input! We want to make contributing to Tip Chain as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Code Style

- Use TypeScript for all new code
- Follow the existing code style (we use ESLint and Prettier)
- Write meaningful commit messages
- Keep functions small and focused
- Add JSDoc comments for public APIs

## Getting Started

1. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/tip-chain.git
   cd tip-chain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
tip-chain/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   └── frame/      # Farcaster frame endpoints
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   └── ui/            # Reusable UI components
├── lib/               # Utility functions
│   ├── types.ts       # TypeScript type definitions
│   ├── contracts.ts   # Smart contract interactions
│   └── utils.ts       # General utilities
└── .github/           # GitHub workflows and templates
```

## Component Guidelines

### UI Components

- Use TypeScript interfaces for props
- Include JSDoc comments
- Support dark mode
- Follow accessibility best practices
- Use Tailwind CSS for styling

Example:
```tsx
interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary';
  /** Click handler */
  onClick?: () => void;
}

/**
 * Reusable button component with consistent styling
 */
export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  // Implementation
}
```

### API Routes

- Use proper HTTP status codes
- Include error handling
- Validate input data with Zod
- Add rate limiting where appropriate
- Document endpoints

Example:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  amount: z.number().positive(),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, recipient } = schema.parse(body);
    
    // Implementation
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

## Testing

- Write unit tests for utility functions
- Add integration tests for API routes
- Test components with React Testing Library
- Ensure frame functionality works with Farcaster

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Commit Messages

Use conventional commit format:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

Example:
```
feat: add multi-chain tip support

- Add Base network integration
- Support USDC token tipping
- Update frame image generation
```

## Issue Reporting

When filing an issue, make sure to answer these questions:

1. What version of the project are you using?
2. What operating system and browser are you using?
3. What did you do?
4. What did you expect to see?
5. What did you see instead?

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists
2. Search existing issues and PRs
3. Provide a clear description of the problem and solution
4. Include mockups or examples if helpful

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or reach out to the maintainers if you have any questions about contributing!
