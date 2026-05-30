import type { MarketKind } from '../common/types';
import { OperationType } from '../common/types';
import { httpPost } from './client';
import { buildEditOrderPayload } from './orders/payloads';
import { buildSignedRequest } from './signing';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface EditOrderParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Nouvelle quantité. */
  size: string;
  /** Nouveau prix. */
  price: string;
  /** ID d'ordre exchange (l'un de `id`/`clientId` requis). */
  id?: string;
  /** Client order id. */
  clientId?: string;
  /** Type de marché ; défaut `perp`. */
  kind?: MarketKind;
}

/** Résultat unifié d'une modification d'ordre (référence du nouvel ordre). */
export interface EditOrderResult {
  /** Paire/symbole. */
  name: string;
  /** ID du nouvel ordre. */
  id: string;
  /** Détails natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

/** Modifie un ordre actif (**écriture signée**, Pacifica `/orders/edit`). */
export function editOrder(params: EditOrderParams, label: string): Promise<EditOrderResult> {
  const payload = buildEditOrderPayload({
    symbol: params.name,
    price: params.price,
    amount: params.size,
    orderId: params.id === undefined ? undefined : Number(params.id),
    clientOrderId: params.clientId,
  });
  const request = buildSignedRequest(OperationType.EditOrder, payload, label);
  return httpPost<{ order_id: number }>('/orders/edit', request, label).then((envelope) => ({
    name: params.name,
    id: String(envelope.data.order_id),
  }));
}
