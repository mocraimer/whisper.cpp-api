FROM ubuntu:22.04 AS build
WORKDIR /app

RUN apt-get update && \
  apt-get install -y build-essential \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

COPY .. .
RUN make

FROM ubuntu:22.04 AS runtime
WORKDIR /app

RUN apt-get update && \
  apt-get install -y curl ffmpeg \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

COPY --from=build /app /app
RUN apt-get update && \
  apt-get install -y curl ffmpeg \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

COPY --from=build /app /app
COPY examples/expressAPI/api.js /app/api.js

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app/api
# Install dependencies
RUN npm install express child_process fs

# Expose the API port
EXPOSE 3000

# Start the API server
CMD ["node", "api.js"]

