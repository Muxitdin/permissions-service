`for .env variables check ".env.example" in the root of the directory`

# Testing using Nats CLI

## start the nats server
```powershell
nats-server -js
```

### permissions.grant
```powershell
nats request permissions.grant '{\"apiKey\":\"key123\",\"module\":\"users\",\"action\":\"create\"}' --server nats://localhost:4222
```
### permissions.revoke
```powershell
nats request permissions.revoke '{\"apiKey\":\"key123\",\"module\":\"users\",\"action\":\"create\"}' --server nats://localhost:4222
```
### permissions.check
```powershell
nats request permissions.check '{\"apiKey\":\"key123\",\"module\":\"users\",\"action\":\"create\"}' --server nats://localhost:4222
```
### permissions.list
```powershell
nats request permissions.list '{\"apiKey\":\"key123\"}' --server nats://localhost:4222
```

