# Security policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.0.7+ | Yes |
| 1.0.6 | Security fixes only |
| < 1.0.6 | No |

## Reporting a vulnerability

Do **not** open a public issue for security problems.

Use [GitHub Security Advisories](https://github.com/terschawebIT/n8n-nodes-ecodms/security/advisories/new) or email **info@terschaweb.it**.

Please include:

- What is affected (credential handling, password storage, download paths, …)
- Steps to reproduce
- Impact (credential leak, SSRF against an ecoDMS host, …)

You should hear back within 7 days. Please do not share a proof of concept publicly until a fix is released.

This node talks to an ecoDMS instance with HTTP Basic Auth. Treat passwords and API keys like secrets; never commit them.
