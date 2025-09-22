# Docker Nginx Round-Robin Load Balancing
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/Pedro-hashm/Docker-Nginx-Round-Robin-)

## Overview

This repository provides a demonstration of using Nginx as a reverse proxy and load balancer for multiple backend services. The entire environment is containerized using Docker and orchestrated with Docker Compose.

The project features two distinct backend microservices:
1.  A Python/Flask application.
2.  A Node.js/Express application.

This setup illustrates how Nginx can distribute incoming traffic between multiple container instances using different load-balancing strategies.

## Project Structure

-   **/app**: A simple Python Flask application that exposes a `/ping` endpoint.
-   **/mult**: A simple Node.js Express application that exposes a `/mult` endpoint for multiplication.
-   **/nginx**: The Nginx load balancer. Its behavior is defined in `nginx.conf`.
-   **docker-compose.yml**: The orchestration file used to build and run all the project's containers.

## Nginx Load Balancing Configuration

The core of the load balancing logic resides in `nginx/nginx.conf`. It uses `upstream` blocks to define groups of backend servers and a `server` block to proxy requests to them.

### `upstream web2_app`

This group routes traffic to the Python Flask application. It uses the default **round-robin** strategy, distributing requests evenly between the two server instances.

```nginx
upstream web2_app {
    server web2-app-1:5000;
    server web2-app-2:5000;
 }
```

### `upstream web2_mult`

This group routes traffic to the Node.js Express application. It employs a **weighted round-robin** strategy.

-   `web2-mult-1` is configured with `weight=3` and will receive three times as many requests as `web2-mult-2`.
-   `web2-mult-3` is a `backup` server that only receives traffic if the primary servers are unavailable.

```nginx
upstream web2_mult {
    server web2-mult-1:3000 weight=3;
    server web2-mult-2:3000 weight=1;
    server web2-mult-3:3000 backup;
}
```

### Server Block

The main Nginx server listens on port 80 and proxies requests based on the URL path:
-   Requests for `/ping` are sent to the `web2_app` upstream group.
-   Requests for `/mult` are sent to the `web2_mult` upstream group.

```nginx
server {
    listen 80;
    server_name app.com;

    location /ping {
         proxy_pass http://web2_app;
     }

    location /mult {
       proxy_pass http://web2_mult;
    }
}
```

## Getting Started

### Prerequisites

-   Docker
-   Docker Compose

### Running the Application

The `nginx.conf` file is configured with specific container hostnames (e.g., `web2-app-1`). To make this work, the `docker-compose.yml` file must define services with these exact names.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pedro-hashm/docker-nginx-round-robin-.git
    cd docker-nginx-round-robin-
    ```

2.  **Update `docker-compose.yml`:**
    Replace the contents of the `docker-compose.yml` file with the following configuration. This will create the specific container instances that Nginx expects.

    ```yaml
    version: '3.7'
    services:
        web2-app-1:
          build: ./app
          container_name: web2-app-1

        web2-app-2:
          build: ./app
          container_name: web2-app-2

        web2-mult-1:
          build: ./mult
          container_name: web2-mult-1
          environment:
            NODE_ENV: production
        
        web2-mult-2:
          build: ./mult
          container_name: web2-mult-2
          environment:
            NODE_ENV: production

        web2-mult-3:
          build: ./mult
          container_name: web2-mult-3
          environment:
            NODE_ENV: production

        nginx:
          container_name: nginx
          build: ./nginx
          ports:
            - "80:80"
          depends_on:
            - web2-app-1
            - web2-app-2
            - web2-mult-1
            - web2-mult-2
            - web2-mult-3
    ```

3.  **Build and Run Containers:**
    From the project's root directory, execute the following command:
    ```bash
    docker-compose up --build
    ```
    This command will build the Docker images and start the Nginx container along with all backend service containers.

## Usage

With the containers running, you can test the load balancer by sending HTTP requests to `localhost:80`.

#### Test the `/ping` Endpoint (Round-Robin)

Send requests to the `/ping` endpoint. While the response will always be the same, Nginx will alternate the requests between the two Python application containers.

```bash
curl http://localhost/ping
```

**Response:**
```
PONG
```

#### Test the `/mult` Endpoint (Weighted Round-Robin)

Send requests to the `/mult` endpoint with two numbers as query parameters.

```bash
curl "http://localhost/mult?a=7&b=6"
```

**Response:**
```
Resultado da multiplicação: 42
```

To observe the load balancing in action, you can monitor the container logs. You will see that `web2-mult-1` logs more incoming requests than `web2-mult-2`.

```bash
docker-compose logs -f
