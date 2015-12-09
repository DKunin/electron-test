node -pe 'JSON.parse(process.argv[1])["version"]' "$(cat ./package.json)" > packver
node -pe 'JSON.parse(process.argv[1])["name"]' "$(cat ./package.json)" > packname
rm -rf ./dist
npm run build
cd ./dist && zip -r -X $(cat ../packname)-$(cat ../packver).zip ./*