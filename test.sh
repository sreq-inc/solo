#!/usr/bin/env bash
# Wrapper script to run tests with Vitest via Bun
exec bun x vitest run "$@"
