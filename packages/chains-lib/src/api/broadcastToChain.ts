// broadcast.ts

import { HexString, PolkadotClient } from "polkadot-api";
import { getApiInstancePapi } from "./connectPapi";
import { ChainKey } from "../ChainsInfo/metadata";
import { InvalidTxError } from "polkadot-api";

interface BroadcastCallbacks {
  onInBlock?: (blockHash: string) => void;
  onFinalized?: (blockHash: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Broadcast a signed extrinsic (SCALE-encoded as a HexString) to the chain.
 *
 * @param {ChainKey} chain - The name of the chain (e.g. 'polkadot').
 * @param {HexString} signedExtrinsic - The signed SCALE-encoded extrinsic to broadcast.
 * @param {BroadcastCallbacks} callbacks - Optional callbacks for events.
 */
export async function broadcastToChain(
  chain: ChainKey,
  signedExtrinsic: HexString,
  { onInBlock, onFinalized, onError }: BroadcastCallbacks = {}
): Promise<void> {
  console.log(`Broadcasting to chain ${chain}`);

  let client: PolkadotClient;
  try {
    client = await getApiInstancePapi(chain);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    onError?.(new Error(`Failed to connect to the endpoint: ${errorMessage}`));
    return;
  }

  // Using submitAndWatch will return an Observable of TxBroadcastEvent
  // We'll convert it to a promise that resolves when finalized or rejects on error
  return new Promise<void>((resolve, reject) => {
    const subscription = client
      .submitAndWatch(signedExtrinsic)
      .subscribe({
        next: (event) => {
          switch (event.type) {
            case "broadcasted":
              console.log(`Transaction broadcasted with hash ${event.txHash}`);
              break;

            case "txBestBlocksState":
              if (event.found) {
                console.log(
                  `Transaction included in block ${event.block.hash} (not finalized yet).`
                );
                onInBlock?.(event.block.hash);
              }
              break;

            case "finalized":
              console.log(
                `Transaction finalized at blockHash ${event.block.hash}`
              );
              if (!event.ok) {
                const errMsg = `Transaction failed on-chain: ${
                  event.dispatchError?.type ?? "Unknown error"
                }`;
                console.log(errMsg);
                onError?.(new Error(errMsg));
                subscription.unsubscribe();
                reject(new Error(errMsg));
                return;
              }
              onFinalized?.(event.block.hash);
              subscription.unsubscribe();
              resolve();
              break;

            default:
              console.log(`Unknown event type: ${(event as any).type}`);
              break;
          }
        },
        error: (err: unknown) => {
          let errorMessage = "Unknown error broadcasting transaction.";
          if (err instanceof InvalidTxError) {
            errorMessage = `Invalid transaction: ${JSON.stringify(err.error)}`;
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }
          console.error(`Transaction error: ${errorMessage}`);
          onError?.(new Error(errorMessage));
          subscription.unsubscribe();
          reject(new Error(errorMessage));
        },
        complete: () => {
          // Subscription completes on successful finalization; already handled in 'finalized' event.
        },
      });
  });
}
