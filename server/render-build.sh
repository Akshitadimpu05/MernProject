#!/bin/bash
# This script installs necessary compilers and tools on Render

# Update package lists
apt-get update

# Install C/C++ compiler
apt-get install -y build-essential

# Install Python
apt-get install -y python3 python3-pip

# Install Java
apt-get install -y default-jdk

# Create necessary directories with proper permissions
mkdir -p /opt/render/project/src/temp
mkdir -p /opt/render/project/src/outputs
chmod 777 /opt/render/project/src/temp
chmod 777 /opt/render/project/src/outputs

# Verify installations
echo "Compiler versions:"
g++ --version
python3 --version
java -version

echo "Setup complete!"
