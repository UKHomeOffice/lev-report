# lev-report
Reports showing usage of LEV.

## Quick start
```
npm install --legacy-peer-deps
npm test
DB_USER=username DB_PASSWORD=password DB_HOST=hostname DB_PORT=port DB_DB=name npm start
```

### Note
The --legacy-peer-deps parameter is required by Node 16 as it has much stricter peer dependency checking than Node 12.

## Local Development & Testing
### Test against an environment
```
POSTGRES_DB=xxx POSTGRES_USER=xxx POSTGRES_PASSWORD=xxx POSTGRES_SSL=true NODE_TLS_REJECT_UNAUTHORIZED=0 npm start
```
#### Note
- Insert appropriate values for the environment variables.
- Start the postgres proxy for the environment
- Set NODE_TLS_REJECT_UNAUTHORIZED=0 to allow self signed certificates during local testing

### Test against a locally running database
```
docker compose up --build

or

docker build .
docker-compose up
```

## Configuration options

### DB_USER
The username for the database containing the usage data.

### DB_PASSWORD
The password for the database.

### DB_HOST
The hostname for the database.

### DB_PORT
The port number for the database.

### DB_DB
The name of the database.

### DB_SSL
If `true`, the database connection will use SSL.

### HTTP_HOST
The host address to which the LEV report server binds.

### HTTP_PORT
The port number to which the LEV report server binds.
