import { readFileSync } from 'node:fs';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  type PacificaClient,
  type WebSocketFactory,
  type WebSocketLike,
  init,
} from '../../src/common/config';
import { WsClient } from '../../src/ws/client';

/**
 * Régression « Sent before connected » (testnet réel, AUCUN mock réseau).
 *
 * `rawSend` ne testait que `this.open`, qui peut être en avance sur l'état réel de la socket : quand
 * `connect()` est rappelé alors qu'une socket est déjà ouverte, `this.socket` est réassigné à une NOUVELLE
 * socket CONNECTING sans qu'un onclose repasse `open` à false. `send()` partait alors sur une socket non
 * connectée → DOMException « Sent before connected », throw non rattrapé dans un microtask → crash (exit 1).
 * On reproduit cet état précis et on vérifie qu'AUCUNE exception ne fuit et que le flux reste fonctionnel.
 */

let ctx: PacificaClient;

function readEnv(name: string): string {
  const content = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
  const line = content.split('\n').find((entry) => entry.startsWith(`${name}=`));
  if (line === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return line.slice(name.length + 1).trim();
}

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');

function trackingFactory(sockets: WebSocketLike[]): WebSocketFactory {
  return (url) => {
    const socket = new globalThis.WebSocket(url) as unknown as WebSocketLike;
    sockets.push(socket);
    return socket;
  };
}

describe('WsClient — pas de « Sent before connected » (testnet réel)', () => {
  const leaks: unknown[] = [];
  const onLeak = (error: unknown): void => {
    leaks.push(error);
  };

  beforeAll(() => {
    ctx = init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  afterEach(() => {
    process.off('uncaughtException', onLeak);
    process.off('unhandledRejection', onLeak);
  });

  it('ne throw pas si un subscribe survient pendant que la socket courante est CONNECTING', async () => {
    process.on('uncaughtException', onLeak);
    process.on('unhandledRejection', onLeak);

    const sockets: WebSocketLike[] = [];
    const client = new WsClient(ctx, { label: account, webSocket: trackingFactory(sockets) });
    client.onError = () => {};
    client.onReconnect = () => {};
    let messages = 0;
    client.subscribePrices(() => {
      messages += 1;
    });

    try {
      await client.connect(); // socket[0] OPEN, open=true
      void client.connect(); // socket[1] CONNECTING, this.socket réassigné, open reste true
      expect(sockets.length).toBe(2);
      expect(sockets[1]?.readyState).toBe(0); // CONNECTING
      // Force flush → pump → rawSend sur socket[1] CONNECTING.
      client.subscribePrices(() => {
        messages += 1;
      });

      await new Promise((resolve) => setTimeout(resolve, 10_000));
      expect(leaks).toEqual([]); // aucune exception n'a fui (le crash d'origine)
      expect(messages).toBeGreaterThan(0); // client resté fonctionnel
    } finally {
      client.disconnect();
      sockets[0]?.close(); // socket[0] écrasée par le 2ᵉ connect : on la ferme.
    }
  }, 30_000);
});
