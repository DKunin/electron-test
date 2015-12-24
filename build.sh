BRANCH=$(git symbolic-ref -q HEAD | cut -d'/' -f 3)
cp ./questons/$BRANCH/q-bank.js ./publictest/script
node -pe 'JSON.parse(process.argv[1])["version"]' "$(cat ./package.json)" > packver
node -pe 'JSON.parse(process.argv[1])["name"]' "$(cat ./package.json)" > packname
rm -rf ./dist
npm run build
cd ./dist && zip -r -X $(cat ../packname)-$(cat ../packver)-$BRANCH.zip ./*