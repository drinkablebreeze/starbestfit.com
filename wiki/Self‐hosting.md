This guide will take you through hosting your own instance of Star Fit.

Please note that because Star Fit is licensed under the [GNU GPLv3](../LICENSE). Ensure you consult the license file for all restrictions if you decide to use or modify the code.

## Choose Your Infrastructure

Before you begin, you'll need to choose where you want to host the frontend, API and database. The choice is up to you, although see below for some suggestions.

### Frontend

The Next.js docs have a great page about [deploying](https://nextjs.org/docs/app/building-your-application/deploying). The easiest method will be using [Vercel](https://vercel.com/docs/concepts/deployments/overview) or [DigitalOcean](https://docs.digitalocean.com/products/app-platform/getting-started/sample-apps/next.js/), however they have listed some alternatives.

You may also use a personal machine, raspberry pi, etc. as long as you have node and yarn installed. Note this may make setting up a domain and SSL certificates more difficult.

### API

The API is written using rust, and so compiles down to an executable you can run from any operating system. A Dockerfile is provided [in the repo](../api/Dockerfile) and should work anywhere you can use Docker, such as an Amazon EC2 instance, DigitalOcean droplet, etc.

If you do use the provided Dockerfile, don't forget to change `--features sql-adaptor` in the compilation step to match your chosen database below.

### Database

The Star Fit API requires a database to store events and availability, and is designed to work with multiple types of databases. You will need to choose one from [this table](../api#storage-adaptors).

## Environment Variables

After you have chosen your infrastructure, you'll need to make sure the correct environment variables are set for the frontend and API.

### Frontend

| Variable | Example | About |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.starbestfit.com` | This needs to be set to where your API will be hosted, so the frontend can communicate with it. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `123-abc.apps.googleusercontent.com` | If you want the Google Calendar sync button to be enabled, you'll need to set up a Google oauth screen and API key. You can follow the steps in [this Google guide](https://developers.google.com/calendar/api/quickstart/js) until you reach "Set up the sample" to get started. |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | `AIzaabcdefghijklmnopqrstuvwxyz` | See above |

### API

| Variable | Example | About |
| --- | --- | --- |
| `FRONTEND_URL` | `https://starbestfit.com` | This needs to be set to the address where your frontend will be hosted, to allow cross-origin requests. If this is set incorrectly you will see CORS errors in the browser console |
| `CRON_KEY` | `abc123` | This can be any string, and is not required. It can be used to protect the cleanup task endpoint of the API, see the [API README](../api#cleanup-task) for more details. |

Each database adaptor may require some environment variables to be set in order to function. Visit the README for a specific adaptor to find out what you'll need to set, e.g. the [SQL adaptor](../api/adaptors/sql/README.md) requires `DATABASE_URL` to be set.

## Current Deployment

For an example, let's take a look at how the current production instance is running at https://starbestfit.com.

### Frontend

The frontend is being hosted with [DigitalOcean](https://digitalocean.com), who have first-class support for [Next.js apps](https://docs.digitalocean.com/products/app-platform/getting-started/sample-apps/next.js/).

#### Environment Variables

There are 3 environment variables set up currently through the app project settings:

```env
NEXT_PUBLIC_API_URL="https://api.starbestfit.com"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="***"
NEXT_PUBLIC_GOOGLE_API_KEY="***"
```

Note that the Google client id and API key are set to allow Google Calendar syncing. This feature will be disabled if these variables are not present.

### API

Like with the frontend, the API is being hosted with [DigitalOcean](https://digitalocean.com)'s App Platform, which is a service that can run Docker images and provides things like SSL certificates and an IP address.

#### Dockerfile

You can visit the dockerfile that's used to run the current API [in the repo](../api/Dockerfile), note that the compilation step uses `--features sql-adaptor` to tell the API to compile with the SQL database adaptor. During app setup on DigitalOcean, we add a PostgreSQL database instance to our app and it automatically adds the correct `DATABASE_URL` environment variable for the backend.

#### Environment Variables

The API currently has 3 environment variable set.

```env
FRONTEND_URL="https://starbestfit.com"
CRON_KEY="***"
DATABASE_URL="***"
```

It's important that the frontend url is set correctly so the API can restrict cross-origin requests.

Note as well that a cron key is set to protect the tasks endpoint, and database url is set so that the API can connect to the PostgreSQL database.
