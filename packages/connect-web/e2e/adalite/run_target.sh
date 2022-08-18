set -e

cd ..
rm -rf ./adalite
# git clone https://github.com/vacuumlabs/adalite.git

# temporary
git clone https://github.com/mroz22/adalite.git
cd ./adalite
git checkout connect-v9

ls -la
cp .env.example .env
# sed -i 's/ADALITE_TREZOR_CONNECT_URL=/ADALITE_TREZOR_CONNECT_URL=https:\/\/localhost:8088/g' .env
yarn
yarn install 
yarn build
yarn dev

