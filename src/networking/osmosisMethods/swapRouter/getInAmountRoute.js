import { getDenomByCode } from './poolLists';
import RouteFinder from './RouteFinder';
import { swapPools } from './poolLists'
import { Dec } from "@keplr-wallet/unit";
import { InRoute } from './Route';

export const getInAmountRoute = async(fromToken, toToken, amount) => {
    const denomIn = getDenomByCode(fromToken.code) || fromToken.fullDenom 
    const denomOut = getDenomByCode(toToken.code) ||  toToken.fullDenom 
    if (denomIn === "" || denomOut === "" || !denomIn || !denomOut){
        return { error: "There is no asset for your symbol!" };
    }

    const MAX_HOPS = 3
    const bigpools = swapPools?.filter(pool => pool.totalWeight.gt(new Dec(1000)));
    const rf = new RouteFinder();
    let bestRoute = new InRoute(amount);
	for (let i = 1; i <= MAX_HOPS; i++) {
        const currentRoute = rf.getBestInRoute(bigpools, denomIn, denomOut, amount, { maxHops: i, maxNumResults: 1 })[0] ?? null;
        if(currentRoute){
            if (bestRoute?.estimateInAmount().lt(currentRoute?.estimateInAmount())) {
                bestRoute = currentRoute
            }
        }  
    }

    if (bestRoute?.estimateInAmount().toString() !== '0')
    {
        const result = {...bestRoute,
            estimateInAmount: bestRoute.estimateInAmount(),
            estimateRate: bestRoute.estimateRate(),
            estimateSlippage: bestRoute.estimateSlipage(),
            swapFee: bestRoute.swapFee(),
             spotPriceBefore: bestRoute.calcSpotPrice(),
            error: false
        }
        return result;
    }
    return { error: "There is no route between pair!" };
}