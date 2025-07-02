#!/bin/bash
cd /home/kavia/workspace/code-generation/dopaclicker-56433-34843eb0/dopamine_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

