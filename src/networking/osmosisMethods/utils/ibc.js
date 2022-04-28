import { Buffer } from "buffer";
import { Hash } from "@keplr-wallet/crypto";

export function makeIBCMinimalDenom(sourceChannelId, coinMinimalDenom) {
  return (
    "ibc/" +
    Buffer.from(
      Hash.sha256(
        Buffer.from(`transfer/${sourceChannelId}/${coinMinimalDenom}`)
      )
    )
      .toString("hex")
      .toUpperCase()
  );
}
