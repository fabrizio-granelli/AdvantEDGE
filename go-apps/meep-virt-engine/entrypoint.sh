#!/bin/bash
set -e

# Configure & update helm repo
helm init --client-only
helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com/
helm repo update

# Start virt engine
exec /meep-virt-engine