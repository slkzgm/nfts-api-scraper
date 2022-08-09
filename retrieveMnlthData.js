const fs = require('fs');
const { performance } = require('perf_hooks');
const path = require("path");
const axios = require("axios");

let dunkGenesis = {
  floorPrice: 0,
  supply: 0,
  equippedSupply: 0,
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
let mnlth = {
  floorPrice: 0
};
let mnlth2 = {
  floorPrice: 0
};
let skinVial = {
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

const retrieveSupplyPerAttributes = async (collectionSlug) => {
  const data = (await axios.get(
      `https://api.opensea.io/api/v1/collection/${collectionSlug}`)
  ).data.collection
  const supply = data.traits['DNA'];

  if (collectionSlug === 'rtfkt-nike-cryptokicks')
    supply.equippedSupply = data.traits['VIAL']['equipped'];
  return supply;
}

const retrieveCollectionData = async (collectionContract, collectionSlug, data) => {
  const stats = await retrieveCollectionStats(collectionContract);
  const attributes = await retrieveCollectionAttributes(collectionContract);
  const dnaAttr = attributes.filter(attr => attr.key === 'DNA');
  const supplyPerAttributes = await retrieveSupplyPerAttributes(collectionSlug);

  data.floorPrice = stats.floorAsk.price;
  if (collectionSlug === 'rtfkt-nike-cryptokicks' || collectionSlug === 'skinvial-evox') {
    data.supply = parseInt(stats.tokenCount);
    Object.keys(supplyPerAttributes).map(dna => {
      if (dna !== 'equippedSupply') {
        const attrData = dnaAttr.filter(attr => attr.value.toLowerCase() === dna)[0];

        data.traits[dna] = {
          floorPrice: attrData ? attrData.floorAskPrices[0] : 0,
          supply: supplyPerAttributes[dna],
          supplyListed: attrData ? attrData.onSaleCount : 0
        }
      }
    });
  }
  if (collectionSlug === 'rtfkt-nike-cryptokicks')
    data.equippedSupply = supplyPerAttributes.equippedSupply;
  return data;
};

const retrieveData = async () => {
  try {
    const start = performance.now();

    await Promise.all([
      retrieveCollectionData('0x86825dfca7a6224cfbd2da48e85df2fc3aa7c4b1', 'rtfkt-mnlth', mnlth),
      retrieveCollectionData('0x6d4bbc0387dd4759eee30f6a482ac6dc2df3facf', 'rtfktmonolith', mnlth2),
      retrieveCollectionData('0x9a06ef3a841316a9e2c1c93b9c21a7342abe484f', 'skinvial-evox', skinVial),
      retrieveCollectionData('0xf661d58cfe893993b11d53d11148c4650590c692', 'rtfkt-nike-cryptokicks', dunkGenesis),
    ]);
    console.log(performance.now() - start);
    return ({
      mnlth,
      mnlth2,
      skinVial,
      dunkGenesis,
      lastUpdate: Date.now()
    });
  } catch (e) {
    console.log(e);
  }
}

const updateJSON = async () => {
  const dataDirectory = path.join(process.cwd(), 'data');
  const filename = '/mnlthData.json';
  const filePath = dataDirectory + filename;
  const data = await retrieveData();
  const json = JSON.stringify(data);

  fs.writeFile(filePath, json, () => console.log(`${filename} updated.`));
}

(async () => {
  await updateJSON();
})();
