/**
 * Coalescing + throttling des messages d'abonnement/désabonnement d'une socket Pacifica.
 *
 * Émettre un `{ method: 'subscribe', params }` par stream inonde la socket dès qu'on suit beaucoup de
 * paires (ex. « tous les perps ») → risque de ban. Ce batcher accumule les abonnements sur un
 * micro-tick et émet **un** message par stream (Pacifica n'accepte qu'un `params` par message →
 * `chunk = 1`), espacés de `intervalMs`. Le format de wire et l'API publique des clients restent
 * inchangés : c'est purement interne à l'émission.
 *
 * Version **généralisée** (vs l'original Aster) : on lui passe la fabrique de frame
 * (`buildSub`/`buildUnsub`) plutôt que de coder `{ method, params, id }` en dur. Surface publique
 * identique aux 4 SDK : `subscribe`/`unsubscribe`/`resubscribe`/`setOpen`/`reset`.
 */
export class SubscriptionBatcher {
  private readonly pendingSub = new Set<string>();
  private readonly pendingUnsub = new Set<string>();
  private readonly outbox: string[] = [];
  private flushScheduled = false;
  private draining = false;
  private open = false;

  /**
   * @param rawSend    Émet une frame déjà sérialisée sur la socket.
   * @param buildSub   Construit la frame d'abonnement à partir des `names` (clés de stream).
   * @param buildUnsub Construit la frame de désabonnement à partir des `names`.
   * @param chunk      Nombre max de streams par message (Pacifica : 1).
   * @param intervalMs Espacement minimal entre deux messages.
   */
  constructor(
    private readonly rawSend: (frame: string) => void,
    private readonly buildSub: (names: string[]) => unknown,
    private readonly buildUnsub: (names: string[]) => unknown,
    private readonly chunk = 1,
    private readonly intervalMs = 60,
  ) {}

  /** Marque un stream à souscrire (annule un unsubscribe en attente du même). */
  public subscribe(name: string): void {
    this.pendingUnsub.delete(name);
    this.pendingSub.add(name);
    this.schedule();
  }

  /** Marque un stream à désouscrire (annule un subscribe en attente du même). */
  public unsubscribe(name: string): void {
    this.pendingSub.delete(name);
    this.pendingUnsub.add(name);
    this.schedule();
  }

  /** Ré-souscrit en masse (reconnexion) : rejoue tous les streams encore suivis. */
  public resubscribe(names: Iterable<string>): void {
    for (const name of names) {
      this.pendingUnsub.delete(name);
      this.pendingSub.add(name);
    }
    this.schedule();
  }

  /** Bascule l'état de la socket : à l'ouverture, on draine la file (throttlée). */
  public setOpen(isOpen: boolean): void {
    this.open = isOpen;
    if (isOpen === true) {
      this.pump();
    }
  }

  /** Vide la file d'envoi (socket fermée) ; les streams suivis sont rejoués via `resubscribe` au reconnect. */
  public reset(): void {
    this.outbox.length = 0;
    this.draining = false;
  }

  private schedule(): void {
    if (this.flushScheduled === true) {
      return;
    }
    this.flushScheduled = true;
    queueMicrotask(() => {
      this.flushScheduled = false;
      this.flush();
    });
  }

  private flush(): void {
    this.enqueue(this.buildUnsub, this.pendingUnsub);
    this.pendingUnsub.clear();
    this.enqueue(this.buildSub, this.pendingSub);
    this.pendingSub.clear();
  }

  private enqueue(build: (names: string[]) => unknown, names: Set<string>): void {
    const all = [...names];
    for (let i = 0; i < all.length; i += this.chunk) {
      this.outbox.push(JSON.stringify(build(all.slice(i, i + this.chunk))));
    }
    this.pump();
  }

  private pump(): void {
    if (this.draining === true || this.open === false || this.outbox.length === 0) {
      return;
    }
    this.draining = true;
    const frame = this.outbox.shift() as string;
    this.rawSend(frame);
    setTimeout(() => {
      this.draining = false;
      this.pump();
    }, this.intervalMs);
  }
}
