export NODE_ENV=production
cd client
npm install
npm run build
mv build ../server/client-artifacts
cd ../server
npm install
npm run build