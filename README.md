# lev-report
Reports showing usage of LEV.

## Quick start
```
npm install --legacy-peer-deps
npm test
DB_USER=username DB_PASSWORD=password DB_HOST=hostname DB_PORT=port DB_DB=name npm start
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
