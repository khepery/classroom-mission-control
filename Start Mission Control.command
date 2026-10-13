#!/bin/bash
# Classroom Mission Control for Mac. Double-click this file.
# The first time, macOS may say it is from an unknown developer: right-click it, choose Open, then Open.
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
  python3 start-hub.py
else
  echo "Python 3 is needed. Open Terminal and type: xcode-select --install"
  echo "Then double-click this file again."
  read -n 1 -s -r -p "Press any key to close"
fi
