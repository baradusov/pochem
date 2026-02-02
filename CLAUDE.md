# Claude Instructions

## Philosophy

This codebase will outlive you. Every shortcut becomes someone else's burden. Every hack compounds into technical debt that slows the whole team down.

You are not just writing code. You are shaping the future of this project. The patterns you establish will be copied. The corners you cut will be cut again.

Fight entropy. Leave the codebase better than you found it.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer (screens/, components/)                       │
│  - Screens and UI components                            │
│  - Only renders, no business logic                      │
│  - Calls store methods, observes state                  │
├─────────────────────────────────────────────────────────┤
│  Adapters (hooks/, controllers/)                        │
│  - Thin adapters between UI framework and stores        │
│  - useAuth(), useProfile(), etc.                        │
├─────────────────────────────────────────────────────────┤
│  Core (core/)                                           │
│  - Business logic lives here                            │
│  - Stores orchestrate everything                        │
│  - MUST be framework-agnostic                           │
│  - Could be extracted to CLI/API without changes        │
├─────────────────────────────────────────────────────────┤
│  Infrastructure (infrastructure/)                       │
│  - Implements ports (interfaces) from core              │
│  - Database adapters, external API adapters             │
│  - Can be swapped without touching business logic       │
└─────────────────────────────────────────────────────────┘
```

## Rules

1. **core/ imports nothing from UI framework or infrastructure/**
   - Business logic must be portable
   - Use dependency injection via ports

2. **UI layer has no business logic**
   - Components only render and call store methods
   - No data transformations in components
   - No API calls in components

3. **Stores are the single source of truth**
   - Stores hold all application state
   - Stores call ports (not concrete implementations)

4. **Ports define contracts**
   - Interfaces in core/ports/
   - Implementations in infrastructure/

## Directory Structure

```
src/
├── screens/                  # UI screens (routing)
├── components/               # Reusable UI components
├── core/                     # Business logic (framework-agnostic)
│   ├── entities/            # Domain models
│   ├── stores/              # State management stores
│   ├── ports/               # Interfaces (contracts)
│   └── utils/               # Pure utility functions
├── infrastructure/          # External service adapters
│   ├── database/           # Database implementation
│   └── api/                # External API adapters
└── hooks/                   # UI framework ↔ Stores adapters
```

## Store Conventions

- Initialize store with auto-observable behavior in constructor
- Each observable field gets its own private setter
- Public methods for actions, private setters for state updates
- Getters for computed/derived values

```typescript
// Good
class AuthStore {
  user: User | null = null;
  loading = true;

  constructor(private authPort: AuthPort) {
    // make observable
  }

  private setUser(user: User | null): void {
    this.user = user;
  }

  private setLoading(loading: boolean): void {
    this.loading = loading;
  }

  async signOut(): Promise<void> {
    await this.authPort.signOut();
    this.setUser(null);
  }
}

// Bad - mutating state directly in async callbacks
class AuthStore {
  async signOut(): Promise<void> {
    await this.authPort.signOut();
    // direct mutation in async context - avoid this
    this.user = null;
  }
}
```

## Ports & Adapters Pattern

Ports are interfaces defined in core that describe what the business logic needs:

```typescript
// core/ports/AuthPort.ts
interface AuthPort {
  signIn(credentials: Credentials): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
```

Adapters are implementations in infrastructure:

```typescript
// infrastructure/database/DatabaseAuthAdapter.ts
class DatabaseAuthAdapter implements AuthPort {
  async signIn(credentials: Credentials): Promise<User> {
    // actual implementation with specific database
  }
}
```

## Code Style

- TypeScript strict mode
- No `any` types without justification
- Prefer composition over inheritance
- Small, focused functions
- Descriptive names over comments
- Arrow functions everywhere (except class methods)
