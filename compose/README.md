# Compose

This is an example development environment with Docker Compose.

First copy the example environment and adapt the values to your needs.

```sh
cp .env.example .env
```

You can then build the application:

```sh
docker compose build api frontend
```

To start the application, pull preexisting images and run the containers.

```sh
docker compose pull
docker compose up -d
```

This makes the application available at http://localhost.localdomain:3001/.

The API will be listening on http://api.localhost.localdomain:3000.

This configuration is prepared to be used for a production instance behind a Traefik reverse proxy.

1. Remove the `ports:` declarations in `compose.yml`.
2. Uncomment the `web` network and the `labels:`.
3. Uncomment the `CRON_KEY` variable.
