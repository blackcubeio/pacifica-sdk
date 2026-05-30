import { sha256 } from '@noble/hashes/sha256';
import {
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
  findAssociatedTokenPda,
} from '@solana-program/token';
import {
  AccountRole,
  address,
  appendTransactionMessageInstruction,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getProgramDerivedAddress,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from '@solana/kit';
import bs58 from 'bs58';
import type { PacificaClient } from '../common/config';
import type { DepositParams } from '../common/types';
import { resolveSigner } from './signing';

const MAINNET_RPC_URL = 'https://api.mainnet-beta.solana.com';
const DEPOSIT_PROGRAM_ID = 'PCFA5iYgmqK6MqPhWNKg7Yv7auX7VZ4Cx7T1eJyrAMH';
const CENTRAL_STATE = '9Gdmhq4Gv1LnNMp7aiS1HSVd7pNnXNMsbuXALCQRmGjY';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SYSTEM_PROGRAM_ID = '11111111111111111111111111111111';

export const DEVNET_RPC_URL = 'https://api.devnet.solana.com';
export const DEVNET_DEPOSIT_PROGRAM_ID = 'peRPsYCcB1J9jvrs29jiGdjkytxs8uHLmSPLKKP9ptm';
export const DEVNET_CENTRAL_STATE = '2zPRq1Qvdq5A4Ld6WsH7usgCge4ApZRYfhhf5VAjfXxv';
export const DEVNET_COLLATERAL_MINT = 'USDPqRbLidFGufty2s3oizmDEKdqx7ePTqzDMbf5ZKM';

export function buildDepositData(amount: number, decimals: number): Uint8Array {
  const discriminator = sha256(new TextEncoder().encode('global:deposit')).slice(0, 8);
  const data = new Uint8Array(16);
  data.set(discriminator, 0);
  new DataView(data.buffer).setBigUint64(8, BigInt(Math.round(amount * 10 ** decimals)), true);
  return data;
}

export function deposit(
  client: PacificaClient,
  params: DepositParams,
  label: string,
): Promise<string> {
  const resolved = resolveSigner(client, label);
  const rpcUrl = params.rpcUrl ?? MAINNET_RPC_URL;
  const rpcSubscriptionsUrl = params.rpcSubscriptionsUrl ?? toSubscriptionsUrl(rpcUrl);
  const rpc = createSolanaRpc(rpcUrl);
  const rpcSubscriptions = createSolanaRpcSubscriptions(rpcSubscriptionsUrl);
  const programAddress = address(params.programId ?? DEPOSIT_PROGRAM_ID);
  const centralState = address(params.centralState ?? CENTRAL_STATE);
  const mint = address(params.collateralMint ?? USDC_MINT);
  const data = buildDepositData(params.amount, params.decimals ?? 6);

  return createKeyPairSignerFromBytes(bs58.decode(resolved.secretKey)).then((payer) =>
    Promise.all([
      findAssociatedTokenPda({ owner: payer.address, tokenProgram: TOKEN_PROGRAM_ADDRESS, mint }),
      findAssociatedTokenPda({ owner: centralState, tokenProgram: TOKEN_PROGRAM_ADDRESS, mint }),
      getProgramDerivedAddress({
        programAddress,
        seeds: [new TextEncoder().encode('__event_authority')],
      }),
      rpc.getLatestBlockhash().send(),
    ]).then(([[depositorAta], [vault], [eventAuthority], latestBlockhash]) => {
      const instruction = {
        programAddress,
        accounts: [
          { address: payer.address, role: AccountRole.WRITABLE_SIGNER },
          { address: depositorAta, role: AccountRole.WRITABLE },
          { address: centralState, role: AccountRole.WRITABLE },
          { address: vault, role: AccountRole.WRITABLE },
          { address: TOKEN_PROGRAM_ADDRESS, role: AccountRole.READONLY },
          { address: ASSOCIATED_TOKEN_PROGRAM_ADDRESS, role: AccountRole.READONLY },
          { address: mint, role: AccountRole.READONLY },
          { address: address(SYSTEM_PROGRAM_ID), role: AccountRole.READONLY },
          { address: eventAuthority, role: AccountRole.READONLY },
          { address: programAddress, role: AccountRole.READONLY },
        ],
        data,
      };
      const baseMessage = createTransactionMessage({ version: 0 });
      const withFeePayer = setTransactionMessageFeePayerSigner(payer, baseMessage);
      const withLifetime = setTransactionMessageLifetimeUsingBlockhash(
        latestBlockhash.value,
        withFeePayer,
      );
      const message = appendTransactionMessageInstruction(instruction, withLifetime);
      const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
      return signTransactionMessageWithSigners(message).then((signedTransaction) => {
        const sendable = signedTransaction as Parameters<typeof sendAndConfirm>[0];
        return sendAndConfirm(sendable, { commitment: 'confirmed' }).then(() =>
          getSignatureFromTransaction(signedTransaction),
        );
      });
    }),
  );
}

function toSubscriptionsUrl(rpcUrl: string): string {
  return rpcUrl.replace('https://', 'wss://').replace('http://', 'ws://');
}
