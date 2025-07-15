#!/bin/bash
# Simple script to start the DevHub backend

cd /Users/beast/Documents/0030/devhub-api
export PATH="$HOME/.local/bin:$PATH"

# Add current directory to Python path
export PYTHONPATH=/Users/beast/Documents/0030/devhub-api:$PYTHONPATH

# Run with uvicorn directly
poetry run uvicorn src.devhub_api.main:app --host 0.0.0.0 --port 8005 --reload
