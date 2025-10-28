#!/bin/sh

mkdir -p output

found=0
for file in ./*.cpp; do
    if [ "$file" = "./*.cpp" ]; then
        break
    fi
    found=1
    filename=$(basename "$file" .cpp)
    echo "Compiling $file -> output/$filename"
    g++ -w -std=c++17 "$file" -o "output/$filename"
    chmod +x "output/$filename"
done

if [ $found -eq 0 ]; then
    echo "No .cpp files found in current directory."
    exit 1
fi
