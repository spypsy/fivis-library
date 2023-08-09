export NODE_ENV=production
cd client
yarn
yarn build
mv build ../server/client-artifacts
cd ../server
yarn
yarn build