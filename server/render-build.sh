#!/bin/bash

# Create necessary directories with proper permissions
echo "Creating temp and outputs directories..."
mkdir -p /opt/render/project/src/server/temp
mkdir -p /opt/render/project/src/server/outputs
chmod -R 777 /opt/render/project/src/server/temp
chmod -R 777 /opt/render/project/src/server/outputs

# Verify compiler installations
echo "Verifying compiler installations..."
which g++ && echo "g++ is installed" || echo "g++ is NOT installed"
which python3 && echo "python3 is installed" || echo "python3 is NOT installed"
which javac && echo "javac is installed" || echo "javac is NOT installed"

echo "Build script completed successfully"
