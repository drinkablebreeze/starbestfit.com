FROM node:20-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock ./
# Omit --production flag for TypeScript devDependencies
RUN if [ -f yarn.lock ]; then yarn install --immutable; fi

COPY src ./src
COPY public ./public
COPY next-env.d.ts .
COPY tsconfig.json .

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG FRONTEND_URL
ENV FRONTEND_URL=${FRONTEND_URL}

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js based on the preferred package manager
RUN if [ -f yarn.lock ]; then yarn build; fi

EXPOSE 3000
ENTRYPOINT ["yarn"]
CMD ["start"]
