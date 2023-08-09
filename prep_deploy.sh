export NODE_ENV=production
cd client
npm
npm run build
mv build ../server/client-artifacts
cd ../server
npm
npm run build