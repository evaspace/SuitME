.PHONY: dev phone stop test test-lint test-build docker-build

COMPOSE := docker compose -f compose.dev.yaml -f compose.test.yaml
DEV_COMPOSE := docker compose -f compose.dev.yaml

# Start the app at http://localhost:3000 with live source updates.
dev:
	$(DEV_COMPOSE) up --build

# Start a private, same-Wi-Fi preview and print the address to open on your phone.
phone:
	@LAN_IP=$$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i=1;i<=NF;i++) if ($$i=="src") {print $$(i+1); exit}}'); \
	if [ -z "$$LAN_IP" ]; then echo "Could not find this computer's Wi-Fi address."; exit 1; fi; \
	echo "Open http://$$LAN_IP:3000 on your phone while it is on the same Wi-Fi."; \
	echo "This is a local preview; it does not publish the app to a hosted server."; \
	$(DEV_COMPOSE) up --build

# Stop the local preview.
stop:
	$(DEV_COMPOSE) down

# Run the available project checks in Docker. The image build is cached between runs.
test:
	$(COMPOSE) run --build --rm test

test-lint:
	$(COMPOSE) run --build --rm test npm run lint

test-build:
	$(COMPOSE) run --build --rm test npm run build

docker-build:
	$(COMPOSE) build test
