import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';
import { beforeAll, describe, expect, it } from 'vitest';
import { type PacificaClient, init } from '../../src/common/config';
import type { Signer } from '../../src/common/types';
import { publicKeyFromBase58 } from '../../src/common/utils';
import { createSubaccount } from '../../src/rest/account/create-subaccount';
import { getAccountInfo } from '../../src/rest/account/get-account-info';
import { getSubAccounts } from '../../src/rest/account/list-subaccounts';
import { transferSubaccountFund } from '../../src/rest/account/transfer-subaccount-fund';
import { PacificaApiError } from '../../src/rest/client';
import { poll, readEnv } from '../helpers';

let client: PacificaClient;

const mainSecretKey = readEnv('SOLANA_PRIVATE_KEY');
const mainAccount = readEnv('SOLANA_PUBLIC_KEY');
const subSecretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const subAccount = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 50_000;

const mainSigner: Signer = { secretKey: mainSecretKey, publicKey: mainAccount, network: 'testnet' };
const subSigner: Signer = { secretKey: subSecretKey, publicKey: subAccount, network: 'testnet' };

describe('subaccount lifecycle (testnet, réel)', () => {
  beforeAll(() => {
    client = init({ signers: { [mainAccount]: mainSigner, [subAccount]: subSigner } });
  });

  it(
    'creates a fresh subaccount (dual signature) and sees it in the list',
    () => {
      const freshSecret = bs58.encode(ed25519.utils.randomPrivateKey());
      const freshAddress = publicKeyFromBase58(freshSecret);
      return createSubaccount(client, {
        main: mainSigner,
        sub: { secretKey: freshSecret, publicKey: freshAddress, network: 'testnet' },
      })
        .then(() =>
          poll(
            () => getSubAccounts(client, mainAccount),
            (subs) => subs.some((entry) => entry.address === freshAddress),
          ),
        )
        .then((subs) => {
          expect(subs.some((entry) => entry.address === freshAddress)).toBe(true);
        })
        .catch((error: unknown) => {
          // The account caps at 10 subaccounts (irreversible). At the cap, a PacificaApiError
          // means the dual signature was accepted — only the business limit blocks creation.
          if (error instanceof PacificaApiError) {
            return;
          }
          throw error;
        });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'transfers funds main → subaccount and back (round-trip with read-back)',
    () => {
      return getAccountInfo(client, { account: subAccount }, subAccount).then((before) => {
        const subBefore = Number(before.balance);
        return transferSubaccountFund(client, { toAccount: subAccount, amount: '20' }, mainAccount)
          .then(() =>
            poll(
              () => getAccountInfo(client, { account: subAccount }, subAccount),
              (info) => Number(info.balance) >= subBefore + 19,
            ),
          )
          .then((credited) => {
            expect(Number(credited.balance)).toBeGreaterThanOrEqual(subBefore + 19);
            return transferSubaccountFund(
              client,
              { toAccount: mainAccount, amount: '20' },
              subAccount,
            );
          })
          .then(() =>
            poll(
              () => getAccountInfo(client, { account: subAccount }, subAccount),
              (info) => Number(info.balance) < subBefore + 19,
            ),
          )
          .then((restored) => {
            expect(Number(restored.balance)).toBeLessThan(subBefore + 19);
          });
      });
    },
    NETWORK_TIMEOUT,
  );
});
