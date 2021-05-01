# Setup

Install the dependencies listed in the `.sdkmanrc` file.
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

### Integration
```
npm run test
```

# Build

```
mvn clean package spring-boot:repackage
```

# Start

```
java -jar target/*.jar -Xmx1024m
```