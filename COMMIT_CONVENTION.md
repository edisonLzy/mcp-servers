# Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for commit messages to ensure a standardized commit history.

## Format

Each commit message consists of a **header**, a **body**, and a **footer**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

The **header** is mandatory and must conform to the format:
- `<type>(<scope>): <subject>`

### Type

The type must be one of the following:

- `build`: Changes that affect the build system or external dependencies
- `chore`: Changes to the auxiliary tools and libraries such as documentation generation
- `ci`: Changes to our CI configuration files and scripts
- `docs`: Documentation only changes
- `feat`: A new feature
- `fix`: A bug fix
- `perf`: A code change that improves performance
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `revert`: Reverts a previous commit
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `test`: Adding missing tests or correcting existing tests

### Scope

The scope should be the name of the package affected (as perceived by the person reading the changelog).

### Subject

The subject contains a succinct description of the change:
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

### Body

The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

## Examples

```
feat(parser): add ability to parse arrays
```

```
fix(middleware): ensure middleware executes in the correct order

This patch ensures that middleware functions are executed in the order they
were added, which fixes an issue where dependencies between middleware were
not being respected.

Closes #28
```

```
refactor(cli): simplify command structure

BREAKING CHANGE: The `--option` flag has been removed in favor of using
configuration files for complex settings.
``` 