# Entity Types and Relationships

**Note:** These types are enforced by the Knowledge Graph API.

## Entity Types

### Codebase Entities (use with `--project=codebase`)

| Type | Use For | Example |
|------|---------|---------|
| `Module` | Packages, directories | `design-system`, `apps/admin` |
| `File` | Source files | `my-cli/index.ts` |
| `Function` | Functions, methods | `validateUser()` |
| `Class` | Classes | `KnowledgeGraphService` |
| `Component` | UI components | `Button`, `Dialog` |
| `DesignToken` | Design system tokens | `color-primary` |
| `API` | Endpoints, services | `POST /api/auth/login` |

### Knowledge Entities

| Type | Use For | Example |
|------|---------|---------|
| `Concept` | Patterns, principles | "CVA Variant Pattern" |
| `Document` | Specs, docs | `knowledge-graph.md` |
| `Requirement` | Feature requirements | "Users must be able to logout" |
| `Contract` | Agreements | "Client MSA 2024" |

### Organization Entities

| Type | Use For | Example |
|------|---------|---------|
| `Person` | Team members, clients | "Georg Stumpf" |
| `Client` | Organizations | "Acme Corp" |
| `Project` | Project namespaces | "my-project" |
| `Feature` | Product features | "Dark Mode" |

## Relationship Types

### Structural

| Relationship | Meaning | Example |
|--------------|---------|---------|
| `CONTAINS` | Parent contains child | Module CONTAINS File |
| `IMPORTS` | File imports another | File IMPORTS File |
| `EXPORTS` | File exports symbol | File EXPORTS Function |
| `EXTENDS` | Inheritance/extension | Component EXTENDS Component |

### Dependency

| Relationship | Meaning | Example |
|--------------|---------|---------|
| `USES` | A uses B | Component USES DesignToken |
| `DEPENDS_ON` | Hard dependency | Module DEPENDS_ON Module |
| `REQUIRES` | Requirement dependency | Feature REQUIRES API |
| `CALLS` | Function invocation | Function CALLS Function |

### Semantic

| Relationship | Meaning | Example |
|--------------|---------|---------|
| `IMPLEMENTS` | Implements pattern/spec | Component IMPLEMENTS Concept |
| `DEFINES` | Defines/creates | File DEFINES Function |
| `REFERENCES` | Soft reference | Document REFERENCES Concept |
| `RELATED_TO` | General association | Concept RELATED_TO Concept |

### Organizational

| Relationship | Meaning | Example |
|--------------|---------|---------|
| `CREATED_BY` | Authorship | Component CREATED_BY Person |
| `OWNS` | Ownership | Person OWNS Project |
| `WORKS_ON` | Assignment | Person WORKS_ON Feature |
| `MANAGES` | Management | Person MANAGES Client |

## Choosing Types

**For codebase structure:** File, Function, Component, Module, IMPORTS, EXPORTS, CALLS, CONTAINS

**For learnings:** Concept with IMPLEMENTS, RELATED_TO

**For people/orgs:** Person, Client, Project with OWNS, WORKS_ON, MANAGES
