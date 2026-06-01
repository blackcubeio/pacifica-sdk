import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  type PacificaClient,
  type WebSocketFactory,
  type WebSocketLike,
  init,
} from '../../src/common/config';
import { WsClient } from '../../src/ws/client';

/**
 * Robustesse WS (testnet réel, AUCUN mock réseau) : on enveloppe la **vraie** socket testnet dans
 * une factory qui en garde une référence pour pouvoir la fermer de force (`socket.close()`) et
 * observer la reconnexion + re-subscribe + reject des promesses en vol. Lectures publiques + une
 * action `cancelAllOrders` non destructive (n'annule rien s'il n'y a pas d'ordre).
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

/** Factory passthrough sur la vraie socket testnet ; mémorise les sockets créées. */
function trackingFactory(sockets: WebSocketLike[]): WebSocketFactory {
  return (url) => {
    const socket = new globalThis.WebSocket(url) as unknown as WebSocketLike;
    sockets.push(socket);
    return socket;
  };
}

describe('WsClient — robustesse (testnet, réseau réel)', () => {
  beforeAll(() => {
    ctx = init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  it('reconnecte et re-souscrit après une fermeture forcée de la socket', async () => {
    const sockets: WebSocketLike[] = [];
    const client = new WsClient(ctx, { label: account, webSocket: trackingFactory(sockets) });
    let reconnected = false;
    client.onReconnect = () => {
      reconnected = true;
    };

    let messages = 0;
    await client.connect();
    const unsubscribe = client.subscribePrices(() => {
      messages += 1;
    });

    // 1) on reçoit des messages sur la 1ʳᵉ socket
    await waitFor(() => messages > 0, 15_000);
    const before = messages;
    expect(sockets.length).toBe(1);

    // 2) coupe brutalement la socket → doit déclencher reconnect + re-subscribe
    sockets[0]?.close();

    // 3) une nouvelle socket est créée et les messages reprennent (re-subscribe effectif)
    await waitFor(() => sockets.length >= 2 && messages > before + 1, 20_000);
    expect(reconnected).toBe(true);
    expect(sockets.length).toBeGreaterThanOrEqual(2);
    expect(messages).toBeGreaterThan(before + 1);

    unsubscribe();
    client.disconnect();
  }, 40_000);

  it('rejette une action en vol quand la socket se ferme (pas de hang)', async () => {
    const sockets: WebSocketLike[] = [];
    const client = new WsClient(ctx, { label: account, webSocket: trackingFactory(sockets) });
    client.onError = () => {};
    client.onReconnect = () => {};
    await client.connect();

    // action signée en vol, puis on coupe la socket avant l'ack
    const pending = client.cancelAllOrders({ allSymbols: true, excludeReduceOnly: false });
    sockets[0]?.close();

    await expect(pending).rejects.toThrow('WebSocket fermé : requête en vol annulée');
    client.disconnect();
  }, 20_000);
});

/** Attend qu'une condition devienne vraie (polling court), sinon échoue après `timeoutMs`. */
async function waitFor(predicate: () => boolean, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (predicate() === false) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitFor: condition non remplie dans le délai imparti');
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
