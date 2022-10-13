import { DenomHelper } from "@keplr-wallet/common";

export const denoms = [
  {
    denom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq"
    ),
    symbol: 'BLOCK (channel-169)',
  },
  {
    denom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-236" }],
      "uglx"
    ),
    symbol: 'GLX (channel-236)',
  },
  {
    denom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3"
    ),
    symbol: 'JOE (channel-169)',
  },
  {
    denom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se"
    ),
    symbol: 'GLTO (channel-169)',
  },
  {
    denom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh"
    ),
    symbol: 'GKEY (channel-169)',
  },
  {
    denom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-297" }],
      "ucre"
    ),
    symbol: 'CRE (channel-297)',
  },
  {
    denom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-355" }],
      "arebus"
    ),
    symbol: 'REBUS (channel-355)',
  },
  {
    denom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-362" }],
      "utori"
    ),
    symbol: 'REBUS (channel-355)',
  },
  {
    denom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-28" }],
      "utick"
    ),
    symbol: 'TICK (channel-28)',
  },
  {
    denom: "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
    symbol: 'INJ',
  },
  {
    denom: "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
    symbol: 'LUNA (channel-251)',
  },
  {
    denom: "ibc/C9B0D48FD2C5B91135F118FF2484551888966590D7BDC20F6A87308DBA670796",
    symbol: 'WBTC.grv (channel-144)',
  },
  {
    denom: "ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
    symbol: 'factory:kujira1qk00h5atutps',
  },
  {
    denom: "ibc/2716E3F2E146664BEFA9217F1A03BFCEDBCD5178B3C71CACB1A0D7584451D219",
    symbol: 'ATOLO (channel-221)',
  },
  {
    denom: "ibc/161D7D62BAB3B9C39003334F1671208F43C06B643CC9EDBBE82B64793C857F1D",
    symbol: 'ORAI (channel-216)',
  },
  {
    denom: "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
    symbol: 'ASVT (channel-169)',
  },
  {
    denom: "ibc/C78F65E1648A3DFE0BAEB6C4CDA69CC2A75437F1793C0E6386DFDA26393790AE",
    symbol: 'USDX (channel-143)',
  },
  {
    denom: "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
    symbol: 'USDT.grv (channel-144)',
  },
  {
    denom: "ibc/4F3B0EC2FE2D370D10C3671A1B7B06D2A964C721470C305CBB846ED60E6CAA20",
    symbol: 'hydrogen (channel-95)',
  },
  {
    denom: "ibc/AB589511ED0DD5FA56171A39978AFBF1371DB986EC1C3526CE138A16377E39BB",
    symbol: 'wmatic-wei (channel-208)',
  },
  {
    denom: "ibc/CD20AC50CE57F1CF2EA680D7D47733DA9213641D2D116C5806A880F508609A7A",
    symbol: 'nanomobx (channel-229)',
  },
  {
    denom: "ibc/7F1A862E98185A286F011DD093D8BD2FA1B7CD1A723EC5E6C59F76692F1728F7",
    symbol: 'ft25FB31D974EED8EBC1CCB168FE',
  },
  {
    denom: "ibc/B4DED8861763C7674BD726FFFE5CAB09BDC3CC706E77C82E46EFEDCF9DB3B495",
    symbol: 'ft7EC1DFFC7248F7437E75BEE3EF',
  },
  {
    denom: "ibc/F35C87A18804313088DAAF6FD430FCCCF1362BC3464D4FAD783C476F594C9CA7",
    symbol: 'ftE141AFEBD94447BADE4946D1BF',
  },
  {
    denom: "ibc/27C09777C9F51B8AAE6BC15F92CFFDF2AB04067569A81D4938BA67EEC8D2E5D3",
    symbol: 'ftB06AFBD13CBFCEB3CDBE449DB3',
  },
  {
    denom: "ibc/A91B70554A510310B2A068979C8E7A9B433EF689E82A9321922D8A1B845B95F5",
    symbol: 'poolDFB8434D5A80B4EAFA94B687',
  },
];
