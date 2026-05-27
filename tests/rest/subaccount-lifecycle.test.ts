import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { publicKeyFromBase58 } from '../../src/common/utils';
import { createSubaccount } from '../../src/rest/account/create-subaccount';
import { getAccountInfo } from '../../src/rest/account/get-account-info';
import { listSubaccounts } from '../../src/rest/account/list-subaccounts';
import { transferSubaccountFund } from '../../src/rest/account/transfer-subaccount-fund';
import { poll, readEnv } from '../helpers';

const mainSecretKey = readEnv('SOLANA_PRIVATE_KEY');
const mainAccount = readEnv('SOLANA_PUBLIC_KEY');
const subSecretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const subAccount = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 50_000;

const mainSigner = { secretKey: mainSecretKey };
const subSigner = { secretKey: subSecretKey };

describe('subaccount lifecycle (testnet, réel)', () => {
  beforeAll(() => {
    init({ network: 'testnet', signer: mainSigner });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'creates a fresh subaccount and sees it in the list',
    () => {
      const freshSecret = bs58.encode(ed25519.utils.randomPrivateKey());
      const freshAddress = publicKeyFromBase58(freshSecret);
      return createSubaccount({ main: mainSigner, sub: { secretKey: freshSecret } })
        .then(() =>
          poll(
            () => listSubaccounts(mainSigner),
            (subs) => subs.some((entry) => entry.address === freshAddress),
          ),
        )
        .then((subs) => {
          expect(subs.some((entry) => entry.address === freshAddress)).toBe(true);
        });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'transfers funds main → subaccount and back (round-trip with read-back)',
    () => {
      return getAccountInfo({ account: subAccount }).then((before) => {
        const subBefore = Number(before.balance);
        return transferSubaccountFund({ toAccount: subAccount, amount: '20' }, mainSigner)
          .then(() =>
            poll(
              () => getAccountInfo({ account: subAccount }),
              (info) => Number(info.balance) >= subBefore + 19,
            ),
          )
          .then((credited) => {
            expect(Number(credited.balance)).toBeGreaterThanOrEqual(subBefore + 19);
            return transferSubaccountFund({ toAccount: mainAccount, amount: '20' }, subSigner);
          })
          .then(() =>
            poll(
              () => getAccountInfo({ account: subAccount }),
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
