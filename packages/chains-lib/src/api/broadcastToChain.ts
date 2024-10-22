// broadcast.ts

import { ApiPromise } from "@polkadot/api";
import { getApiInstance } from "./connect";
import { CHAIN_METADATA, ChainKey } from "../ChainsInfo/metadata";
import toast from "react-hot-toast";
import { SubmittableExtrinsic } from "@polkadot/api-base/types";

/**
 * Broadcast a signed extrinsic to the chain.
 *
 * @param {ChainKey} chain - The name of the chain (e.g. 'polkadot').
 * @param {any} signedExtrinsic - The signed extrinsic to broadcast.
 */
export async function broadcastToChain(
  chain: ChainKey,
  signedExtrinsic: any,
  { onInBlock, onFinalized, onError }: { onInBlock?: (blockHash: string) => void; onFinalized?: (blockHash: string) => void; onError?: (error: Error) => void }
): Promise<void> {
  console.log(`broadcasting`);
  let api: ApiPromise;
  try {
    const controller = new AbortController();
    api = await getApiInstance(chain, controller.signal);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    onError?.(new Error(`Failed to connect to the endpoint: ${errorMessage}`));
    return;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const unsub = signedExtrinsic.send(({ status, events, dispatchError }: { status: any; events: any; dispatchError: any }) => {
        if (dispatchError) {
          let errorMessage;
          if (dispatchError.isModule) {
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { docs, method, section } = decoded;
            errorMessage = `${section}.${method}: ${docs.join(' ')}`;
          } else {
            errorMessage = dispatchError.toString();
          }
          onError?.(new Error(`Transaction error: ${errorMessage}`));
          console.log(`Transaction error: ${errorMessage}`);
          unsub();
          reject(new Error(errorMessage));
          return;
        }

        if (status.isInBlock) {
          console.log(
            `Transaction included at blockHash ${status.asInBlock.toString()}`
          );
          onInBlock?.(status.asInBlock.toString());
        } else if (status.isFinalized) {
          console.log(
            `Transaction finalized at blockHash ${status.asFinalized.toString()}`
          );
          onFinalized?.(status.asFinalized.toString());
          unsub();
          resolve();
        } else if (status.isDropped || status.isInvalid || status.isUsurped) {
          const errorMessage = `Error with transaction: ${status.type}`;
          onError?.(new Error(errorMessage));
          console.log(`Transaction status error: ${errorMessage}`);
          unsub();
          reject(new Error(errorMessage));
        }
      });
    });
  } catch (error) {
    const errorMessage = `Error broadcasting transaction: ${
      error instanceof Error ? error.message : String(error)
    }`;
    onError?.(new Error(errorMessage));
    console.log(`Broadcast error: ${errorMessage}`);
    throw error; // Re-throw the error
  }
}
