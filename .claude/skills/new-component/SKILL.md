# Create a New UI Component

Create a new React component for the frontend following the project's established conventions.

## Component conventions

- Components live in `frontend/src/components/<ComponentName>/`
- Each component directory contains exactly three files:
  - `<ComponentName>.tsx` — the component implementation
  - `<ComponentName>.test.tsx` — Vitest + Testing Library tests
  - `index.ts` — barrel re-export
- Use MUI (`@mui/material`) as the primary UI building block
- Props are defined as a TypeScript `interface` named `<ComponentName>Props`, exported from the component file
- No `any` types; strict TypeScript throughout
- No inline comments unless the WHY is non-obvious

## Steps

1. **Clarify requirements**: If the component name, purpose, or key props are not clear from the
   invocation, ask before writing anything. Do not ask about things you can decide yourself
   (internal state shape, MUI component choices, styling details).

2. **Explore existing components**: Run
   ```bash
   find frontend/src/components -type f | sort
   ```
   Read a few representative components to absorb current patterns (prop naming, hook usage,
   MUI usage, test style) before writing anything new.

3. **Plan the component**:
   - What props does it accept? List them with types.
   - Does it need local state? Which hooks?
   - Does it call any backend API? If so, map the endpoint and response shape.
   - Does it need to be integrated into the router or an existing page?

4. **Resolve ambiguity**: If there is a genuine trade-off between two valid approaches (e.g.,
   controlled vs. uncontrolled, MUI component choice with meaningfully different UX), ask the user.
   Do not ask about trivial details.

5. **Create the files**: Create the four files below.

   **`frontend/src/components/<ComponentName>/<ComponentName>.tsx`**
   - Export a `<ComponentName>Props` interface
   - Export a default function component
   - Build UI from MUI primitives
   - Keep the component focused; extract sub-components only when complexity demands it

   **`frontend/src/components/<ComponentName>/index.ts`**
   ```ts
   export { default } from "./<ComponentName>";
   export type { <ComponentName>Props } from "./<ComponentName>";
   ```

   **`frontend/src/components/<ComponentName>/<ComponentName>.test.tsx`**
   - Use Vitest (`describe`, `it`, `expect`) and `@testing-library/react`
   - Cover: renders without crashing, key prop variations, user interactions if any
   - Do not mock MUI internals; test behavior, not implementation
   - Follow these guidelines for code organization and mocking:
     - `beforeEach(() => vi.clearAllMocks())` in every top-level `describe`.
     - `describe(ComponentName, ...)` — pass the component reference, not a string.
     - `vi.mock(import('../../api/someApi'))` — dynamic-import form for module mocking.
     - Use `vi.mocked(module.fn)` for type-safe mock references.
     - Declare callback mocks (`const onClose = vi.fn()`) at the `describe` scope.
     - Provide a local render helper (e.g. `const renderModal = () => render(...)`) to avoid repetition.
     - Query with accessible selectors: `getByRole`, `getByLabelText`, `findBy*` for async.
     - Use `userEvent.setup()` for user interactions; `waitFor` for async assertions.

   **`frontend/src/components/<ComponentName>/__mocks__/<ComponentName>.stories.tsx`**
   - Every component should have 1 or more stories for interactive testing of their primary states
   - Use CSF3 format (`satisfies Meta<typeof Component>` + `StoryObj<typeof meta>`).
   - Use `fn()` from `@storybook/test` for callback props.
   - Components that call APIs on mount use MSW handlers via `parameters.msw.handlers`.

6. **Wire it up** (if applicable): If the task specifies where to use the component (a page,
   a route, another component), make that integration change too.

7. **Verify**:
   ```bash
   cd frontend && npm test -- --reporter=verbose 2>&1 | tail -40
   npm run tsc
   ```
   Fix any test failures or type errors before proceeding.

8. **Lint and format**:
   ```bash
   npm run lint:fix
   npm run format:fix
   ```

9. **Report back**: Summarize what was created (file paths), the component's public API (props
   interface), and any integration points added.
