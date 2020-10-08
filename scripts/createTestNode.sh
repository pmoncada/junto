#!/bin/bash

npx buidler clean
npm run compile
npm run build
npx buidler node
