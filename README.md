# Setup

Install the NodeJS dependencies listed in the `.nvmrc` file.
Install Postgres 12.
Install direnv.

Create a copy of the `.envrc.example` file called `.envrc`. Fill in the appropriate environment variables.

Then, run:
```
direnv allow
npm install
```

# Test

```
npm test
```

See `package.json` for other testing commands.

# Start

```
npm start
```