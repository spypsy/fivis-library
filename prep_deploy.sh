export NODE_ENV=production
cd client
yarn
yarn build
cd ../server
yarn
yarn build
yarn start