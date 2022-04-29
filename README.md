![osmosis](https://github.com/BaratMaira/OsmosisLogo/blob/main/OsmosisLogo.png?raw=true)

## Osmosis Citadel.one app
   
   Citadel.one started its journey as a validator and easy-to-use staking wallet; now the main focus is to provide an ecosystem-like platform that empowers various crypto use-cases. With this in mind, we’ve integrated Osmosis among the first show-cases in Citadel.one App Store along with Uniswap and PancakeSwap . We’ve carefully packed all the functionality of Osmosis, including Superfluid, and implemented it inside the web version of our platform - mobile integration is also in the pipeline. Additionally, users will be able to take advantage of Osmosis functionality "implicitly" as a part of an aggregated swap, or receive tokens with the purpose to use it within another application immediately thereafter.
   
   Read more about Osmosis within Citadel.one App Store via the [link]


Enabled actions:
- [x] Swap with optimized routing
- [x] Swap for exact amount out
- [x] LP and bonding
- [x] Superfluid staking
- [x] Create new pool
- [x] External API for other Citadel apps for a swap
- [x] Update UI kit (remove VK elements)
- [x] External insentivesied pools
- [x] Frontier tokens

[//]: #

   [link]: <https://medium.com/citadel-one/how-to-use-osmosis-extension-75fc5b6169e5>
   

## How to use Osmosis Router

1. Call function `getAllPools` to load all pools information.

```
import {getAllPools} from '/swapRouter/poolLists'
const { swapPools } = await getAllPools()
```
This function sends a request to these APIs:
1.https://api-osmosis.imperator.co/pools/v2/all?low_liquidity=true
2.https://lcd-osmosis.keplr.app/osmosis/gamm/v1beta1/pools?pagination.limit=750

2. Call function `getOutAmountRoute` by passing 3 params inTokenCode, outTokenCode and amount to get swap trade information(to estimated).

```
import { getOutAmountRoute } from '/swapRouter/getOutAmountRoute'
const trade = await getOutAmountRoute('ATOM', 'OSMO', 1)
```

3. Call function `getInAmountRoute` by passing 3 params inTokenCode, outTokenCode and amount to get swap trade information(from estimated).

```
import { getInAmountRoute } from '/swapRouter/getInAmountRoute'
const trade = await getInAmountRoute('ATOM', 'OSMO', 1)
```
The results of getOutAmountRoute():
```
{
    "amount": {
        "int": "1000000000000000000"
    },
    "poolRoute": [
        {
            "id": 600,
            "from": {
                "denom": "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
                "symbol": "ATOM",
                "usdPrice": 20.485242404808886,
                "decimal": 6
            },
            "to": {
                "denom": "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
                "symbol": "CMDX",
                "usdPrice": 0.9084815486230138,
                "decimal": 6
            },
            "amountOut": {
                "int": "22573906541813511626"
            }
        },
        {
            "id": 601,
            "from": {
                "denom": "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
                "symbol": "CMDX",
                "usdPrice": 0.9084815486230138,
                "decimal": 6
            },
            "to": {
                "denom": "uosmo",
                "symbol": "OSMO",
                "usdPrice": 4.357306819205193,
                "decimal": 6
            },
            "amountOut": {
                "int": "4692485672576981532"
            }
        }
    ],
    "estimateOutAmount": {
        "int": "4692485672576981532"
    },
    "estimateRate": 4.692485,
    "estimateSlippage": 0.000014,
    "swapFee": 0.00599
}
```
