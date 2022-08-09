const fs = require('fs');
const { performance } = require('perf_hooks');
const path = require("path");
const axios = require("axios");

let cloneX = {
  floorPrice: 0,
  supply: 0,
  traits: {
    human: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    robot: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    demon: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    angel: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    reptile: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    undead: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    murakami: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    alien: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
  }
};
let mintVial = {
  floorPrice: 0
};

const retrieveCollectionStats = async (collectionContract) => (await axios.get(
    `https://api.reservoir.tools/collection/v3?id=${collectionContract}`,
    {
      headers: {
        Accept: '*/*',
      }})
).data.collection;

const retrieveCollectionAttributes = async (collectionContract) => (await axios.get(
    `https://api.reservoir.tools/collections/${collectionContract}/attributes/explore/v3?limit=5000`,
    {
      headers: {
        Accept: '*/*',
      }})
).data.attributes;

const retrieveSupplyPerAttributes = async (collectionSlug) => (await axios.get(
    `https://api.opensea.io/api/v1/collection/${collectionSlug}`)
).data.collection.traits['DNA'];

const retrieveCollectionData = async (collectionContract, collectionSlug, data) => {
  const stats = await retrieveCollectionStats(collectionContract);
  const attributes = await retrieveCollectionAttributes(collectionContract);
  const dnaAttr = attributes.filter(attr => attr.key === 'DNA');
  const supplyPerAttributes = await retrieveSupplyPerAttributes(collectionSlug);

  data.floorPrice = stats.floorAsk.price;
  if (collectionSlug === 'clonex') {
    data.supply = parseInt(stats.tokenCount);
    Object.keys(supplyPerAttributes).map(dna => {
      const attrData = dnaAttr.filter(attr => attr.value.toLowerCase() === dna)[0];

      data.traits[dna] = {
        floorPrice: attrData ? attrData.floorAskPrices[0] : 0,
        supply: supplyPerAttributes[dna],
        supplyListed: attrData ? attrData.onSaleCount : 0
      }
    });
  }

  return data;
};

const retrieveData = async () => {
  try {
    const start = performance.now();

    await Promise.all([
      retrieveCollectionData('0x348fc118bcc65a92dc033a951af153d14d945312', 'clonex-mintvial', mintVial),
      retrieveCollectionData('0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b', 'clonex', cloneX)
    ]);
    console.log(performance.now() - start);
    return ({
      mintVial,
      cloneX,
      lastUpdate: Date.now(),
    });
  } catch (e) {
    console.log(e);
  }
}

const updateJSON = async () => {
  const dataDirectory = path.join(process.cwd(), 'data');
  const filename = '/mintVialData.json';
  const filePath = dataDirectory + filename;
  const data = await retrieveData();
  const json = JSON.stringify(data);

  fs.writeFile(filePath, json, () => console.log(`${filename} updated.`));
}

(async () => {
  await updateJSON();
})();
