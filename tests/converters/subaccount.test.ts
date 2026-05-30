import { describe, expect, it } from 'vitest';
import type { SubAccount } from '../../src/common/types';
import { SubAccountConverter, type SubAccountNative } from '../../src/rest/converters/subaccount';

const SUBACCOUNT_CORE_KEYS = ['address'];

const NATIVE: SubAccountNative = {
  address: '0xabc0000000000000000000000000000000000001',
  balance: '1000.0',
  feeLevel: 2,
  feeMode: 'maker',
  createdAt: 1_700_000_000_000,
};

describe('SubAccountConverter Pacifica — bijectivité + conformité', () => {
  const conv = new SubAccountConverter();

  it('toCommon : address extraite, reste dans xtras', () => {
    expect(conv.toCommon(NATIVE)).toEqual({
      address: '0xabc0000000000000000000000000000000000001',
      xtras: {
        balance: '1000.0',
        feeLevel: 2,
        feeMode: 'maker',
        createdAt: 1_700_000_000_000,
      },
    } satisfies SubAccount);
  });

  it('cœur conforme', () => {
    const core = Object.keys(conv.toCommon(NATIVE))
      .filter((k) => k !== 'xtras')
      .sort();
    expect(core).toEqual(SUBACCOUNT_CORE_KEYS);
  });

  it('toNative(toCommon(native)) ≡ native', () => {
    expect(conv.toNative(conv.toCommon(NATIVE))).toEqual(NATIVE);
  });
});
