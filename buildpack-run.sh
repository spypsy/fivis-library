export NODE_ENV=production
cd client
npm
npm build
mv build ../server/client-artifacts
cd ../server
npm
npm build