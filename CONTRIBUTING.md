# Contributing to V3BMusic.AI

Welcome to the V3BMusic.AI engineering team! This guide will help you contribute effectively to our codebase.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase CLI (optional for local development)
- Code editor (VS Code recommended)

### Setup
```bash
# Clone repository
git clone https://github.com/yourusername/v3bmusic.git
cd v3bmusic

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase credentials

# Start development server
npm run dev
```

## Documentation

### Essential Reading
1. **[ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)** - System architecture and coding standards
2. **[TEAM_GUIDE.md](./TEAM_GUIDE.md)** - Team processes and collaboration
3. **[MOBILE_APP_GUIDE.md](./MOBILE_APP_GUIDE.md)** - PWA and mobile optimization

### Architecture Documents
- **Backend:** Edge Functions, Database Schema, RLS Policies
- **Frontend:** Component structure, Service layer, State management
- **Deployment:** CI/CD pipeline, Environment setup

## Code Standards

### File Size Limits
- **Components:** Max 250 lines (prefer 150)
- **Pages:** Max 300 lines
- **Services:** Max 400 lines
- **Edge Functions:** Max 300 lines

### TypeScript
All code must be TypeScript with strict mode enabled. No `any` types allowed.

```typescript
✓ GOOD:
function processPayment(amount: number): PaymentResult {
  // ...
}

✗ BAD:
function processPayment(amount: any): any {
  // ...
}
```

### Component Structure
```typescript
// 1. Imports (grouped)
import React from 'react';
import { useTranslation } from 'react-i18next';

// 2. Types
interface Props {
  title: string;
}

// 3. Component
export default function MyComponent({ title }: Props) {
  const { t } = useTranslation();

  return <div>{title}</div>;
}
```

### Service Layer
Business logic belongs in services, NOT in components:

```typescript
✓ GOOD:
// In service:
export class PaymentService {
  async processPayment(amount: number) { /* logic */ }
}

// In component:
const service = new PaymentService();
const result = await service.processPayment(100);

✗ BAD:
// In component:
const { data } = await supabase.from('payments').insert({ amount: 100 });
```

## Git Workflow

### Branch Naming
```
feature/user-authentication
bugfix/payment-calculation
hotfix/security-patch
refactor/upload-service
docs/api-documentation
```

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add DCCS registration flow
fix: correct royalty split calculation
refactor: extract payment service
docs: update architecture guide
test: add upload service tests
chore: update dependencies
```

### Pull Request Process

1. **Create Feature Branch**
```bash
git checkout -b feature/my-feature
```

2. **Make Changes**
- Write code following standards
- Add tests
- Update documentation

3. **Self-Review**
- Run linter: `npm run lint`
- Run tests: `npm test`
- Check types: `npm run type-check`
- Build: `npm run build`

4. **Create Pull Request**
- Fill out PR template completely
- Link related issues
- Add screenshots for UI changes
- Request review from relevant team

5. **Address Feedback**
- Make requested changes
- Re-request review

6. **Merge**
- Squash commits if needed
- Delete feature branch after merge

## Code Review Guidelines

### As a Reviewer
- Be constructive and respectful
- Explain the "why" behind suggestions
- Approve if minor changes needed
- Request changes for major issues

### Review Checklist
- [ ] Code follows style guide
- [ ] Business logic in services
- [ ] Types defined
- [ ] Error handling present
- [ ] Tests included
- [ ] Documentation updated
- [ ] No security issues
- [ ] Performance considered

## Testing

### Required Tests
- **Unit Tests:** All services must have unit tests
- **Integration Tests:** API endpoints need integration tests
- **E2E Tests:** Critical user flows

### Running Tests
```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm run test:coverage # Coverage report
```

### Writing Tests
```typescript
// Unit test example
describe('PaymentService', () => {
  it('should calculate correct split', () => {
    const service = new PaymentService();
    const result = service.calculateSplit(100, 0.7);
    expect(result.artist).toBe(70);
  });
});
```

## Edge Functions

### Using Shared Utilities
Always use shared utilities from `_shared/`:

```typescript
import { corsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { createClient } from '../_shared/db.ts';
import { validateAuth } from '../_shared/auth.ts';
import { handleError } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logging.ts';
```

### Edge Function Template
```typescript
import { handleCorsPreflightRequest } from '../_shared/cors.ts';
import { createClient } from '../_shared/db.ts';
import { validateAuth } from '../_shared/auth.ts';
import { handleError } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logging.ts';

const logger = createLogger('my-function');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const user = await validateAuth(req);
    const supabase = createClient(req);
    const { data } = await req.json();

    // Business logic

    logger.info('Success');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Failed', error);
    return handleError(error);
  }
});
```

## Database

### Migrations
```bash
# Create migration
supabase migration new my_migration_name

# Apply locally
supabase db reset

# Deploy to production (via Supabase dashboard)
```

### Migration Template
```sql
/*
  # Description

  1. Changes
     - Add table X
     - Modify column Y

  2. Security
     - Enable RLS
     - Add policies
*/

CREATE TABLE IF NOT EXISTS my_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_name" ON my_table
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

## Common Tasks

### Adding a New Page
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Create service if needed in `src/services/`
4. Add tests
5. Update documentation

### Adding a New Edge Function
1. Create directory in `supabase/functions/`
2. Use shared utilities
3. Implement business logic
4. Add error handling
5. Deploy via Supabase CLI or dashboard
6. Test endpoint

### Updating Shared Utilities
1. Modify file in `supabase/functions/_shared/`
2. Update all consuming functions
3. Test all affected functions
4. Deploy all functions

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Tests Fail
```bash
# Update snapshots
npm test -- -u

# Run specific test
npm test -- MyComponent
```

### Type Errors
```bash
# Check types
npm run type-check

# Fix auto-fixable issues
npm run lint:fix
```

## Getting Help

### Resources
- **Slack Channels:**
  - `#engineering` - General questions
  - `#frontend` - Frontend help
  - `#backend` - Backend help
  - `#platform` - Infrastructure help

- **Documentation:**
  - Architecture Guide
  - Team Guide
  - API Documentation

- **Team Leads:**
  - Frontend Lead: [Name]
  - Backend Lead: [Name]
  - Platform Lead: [Name]
  - Tech Lead: [Name]

### Office Hours
- **Monday 2pm:** Frontend office hours
- **Wednesday 2pm:** Backend office hours
- **Friday 11am:** Architecture review

## License

Copyright © 2025 Victor360 Brand Limited. All rights reserved.

---

**Thank you for contributing to V3BMusic.AI!**

Together we're building the future of digital copyright and audio licensing.
