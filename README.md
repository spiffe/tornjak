# Tornjak

![Tornjak logo](logos/tornjak_logo.jpg)

[![Development Phase](https://img.shields.io/badge/SPIFFE-Dev-orange.svg?logoWidth=18&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHJvbGU9ImltZyIgdmlld0JveD0iMC4xMSAxLjg2IDM1OC4yOCAzNTguMjgiPjxzdHlsZT5zdmcge2VuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzYwIDM2MH08L3N0eWxlPjxzdHlsZT4uc3QyLC5zdDN7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDojYmNkOTE4fS5zdDN7ZmlsbDojMDRiZGQ5fTwvc3R5bGU+PGcgaWQ9IkxPR08iPjxwYXRoIGQ9Ik0xMi4xIDguOWgyOC4zYzIuNyAwIDUgMi4yIDUgNXYyOC4zYzAgMi43LTIuMiA1LTUgNUgxMi4xYy0yLjcgMC01LTIuMi01LTVWMTMuOWMuMS0yLjcgMi4zLTUgNS01eiIgY2xhc3M9InN0MiIvPjxwYXRoIGQ9Ik04OC43IDguOWgyNThjMi43IDAgNSAyLjIgNSA1djI4LjNjMCAyLjctMi4yIDUtNSA1aC0yNThjLTIuNyAwLTUtMi4yLTUtNVYxMy45YzAtMi43IDIuMi01IDUtNXoiIGNsYXNzPSJzdDMiLz48cGF0aCBkPSJNMzQ2LjcgODUuNWgtMjguM2MtMi43IDAtNSAyLjItNSA1djI4LjNjMCAyLjggMi4yIDUgNSA1aDI4LjNjMi43IDAgNS0yLjIgNS01VjkwLjVjMC0yLjgtMi4zLTUtNS01eiIgY2xhc3M9InN0MiIvPjxwYXRoIGQ9Ik0xOTMuNiA4NS41SDEyLjFjLTIuNyAwLTUgMi4zLTUgNXYyOC4zYzAgMi43IDIuMiA1IDUgNWgxODEuNWMyLjcgMCA1LTIuMiA1LTVWOTAuNWMwLTIuOC0yLjItNS01LTV6IiBjbGFzcz0ic3QzIi8+PHBhdGggZD0iTTI3MC4yIDg1LjVoLTI4LjNjLTIuNyAwLTUgMi4yLTUgNXYyOC4zYzAgMi44IDIuMiA1IDUgNWgyOC4zYzIuNyAwIDUtMi4yIDUtNVY5MC41Yy0uMS0yLjgtMi4zLTUtNS01eiIgY2xhc3M9InN0MiIvPjxwYXRoIGQ9Ik0yNzAuMiAxNjJIODguN2MtMi43IDAtNSAyLjItNSA1djI4LjNjMCAyLjcgMi4yIDUgNSA1aDE4MS41YzIuNyAwIDUtMi4yIDUtNVYxNjdjLS4xLTIuOC0yLjMtNS01LTV6IiBjbGFzcz0ic3QzIi8+PHBhdGggZD0iTTM0Ni43IDE2MmgtMjguM2MtMi43IDAtNSAyLjItNSA1djI4LjNjMCAyLjggMi4yIDUgNSA1aDI4LjNjMi43IDAgNS0yLjIgNS01VjE2N2MwLTIuOC0yLjMtNS01LTV6bS0zMDYuMyAwSDEyLjFjLTIuNyAwLTUgMi4yLTUgNXYyOC4zYzAgMi44IDIuMiA1IDUgNWgyOC4zYzIuNyAwIDUtMi4yIDUtNVYxNjdjMC0yLjgtMi4yLTUtNS01em0tMjguMyA3Ni41aDI4LjNjMi43IDAgNSAyLjIgNSA1djI4LjNjMCAyLjctMi4yIDUtNSA1SDEyLjFjLTIuNyAwLTUtMi4yLTUtNXYtMjguM2MuMS0yLjcgMi4zLTUgNS01eiIgY2xhc3M9InN0MiIvPjxwYXRoIGQ9Ik0xNjUuMiAyMzguNWgxODEuNWMyLjcgMCA1IDIuMiA1IDV2MjguM2MwIDIuNy0yLjIgNS01IDVIMTY1LjJjLTIuNyAwLTUtMi4yLTUtNXYtMjguM2MwLTIuNyAyLjItNSA1LTV6IiBjbGFzcz0ic3QzIi8+PHBhdGggZD0iTTg4LjcgMjM4LjVIMTE3YzIuNyAwIDUgMi4yIDUgNXYyOC4zYzAgMi43LTIuMiA1LTUgNUg4OC43Yy0yLjcgMC01LTIuMi01LTV2LTI4LjNjMC0yLjcgMi4yLTUgNS01em0yNTggNzYuN2gtMjguM2MtMi43IDAtNSAyLjItNSA1djI4LjNjMCAyLjggMi4yIDUgNSA1aDI4LjNjMi43IDAgNS0yLjIgNS01di0yOC4zYzAtMi44LTIuMy01LTUtNXoiIGNsYXNzPSJzdDIiLz48cGF0aCBkPSJNMjcwLjIgMzE1LjJoLTI1OGMtMi43IDAtNSAyLjItNSA1djI4LjNjMCAyLjcgMi4yIDUgNSA1aDI1OGMyLjcgMCA1LTIuMiA1LTV2LTI4LjNjLS4xLTIuOC0yLjMtNS01LTV6IiBjbGFzcz0ic3QzIi8+PC9nPjwvc3ZnPg==)](https://github.com/spiffe/spiffe/blob/main/MATURITY.md#development)

The project aims to provide a management plane and capabilities for SPIFFE identities managed by SPIRE.
The goals are to provide global visibility, auditability, and configuration and policy management for identities.
This can be thought about as a central management plane for identities across SPIRE servers, with the aim for use by an administrator or CISO to govern an organization's workload identities.

## About Us
* Tornjak [Slack](https://spiffe.slack.com/archives/C024JTTK58T) channel on CNCF SPIFFE
* Tornjak [Blogs](./docs/blogs.md)
* YouTube [Tornjak channel](https://www.youtube.com/@tornjak)

## Get Started

The following are guides on how to try out Tornjak:
- [Tornjak simple deployment with SPIRE k8s quickstart](docs/quickstart/README.md)

Here are a few additional resources:
- [Tornjak basic functions demo](https://www.youtube.com/watch?v=dOdRu4psKJ8)

In case of deployment or configuration troubles, check out our [hints documenation](./docs/tornjak-hints.md)

## Architecture and roadmap

The architecture consists of 2 main components, the agent and the manager.
- The manager provides a management control plane for SPIRE servers, and a central point of data collection. It interacts with the agents, SPIRE servers, and corresponding components to achieve this.
- The agent provides a way for the management plane to communicate with the SPIRE servers and provide introspection and configuration of identities.

For more details of the components and execution plan, please refer to these documents
- [Manager design and details](docs/tornjak-manager.md)
- [Agent design and details](docs/tornjak-agent.md)
- [Execution plan](docs/plan.md)

## Development: Building and pushing

To request features or report bugs, please use [Github Issues](https://github.com/spiffe/tornjak/issues). To get started on development, please see [CONTRIBUTING](./CONTRIBUTING.md)

