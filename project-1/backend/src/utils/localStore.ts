import fs from 'fs';
import path from 'path';

// High-speed In-Memory Resilient Store for Dukaan AI
// Guarantees zero-setup demo reliability if local MongoDB instance is offline or unreachable
export class LocalDataStore {
  private static instance: LocalDataStore;
  public users: any[] = [];
  public items: any[] = [];
  public suppliers: any[] = [];
  public invoices: any[] = [];
  public purchaseOrders: any[] = [];

  private constructor() {}

  public static getInstance(): LocalDataStore {
    if (!LocalDataStore.instance) {
      LocalDataStore.instance = new LocalDataStore();
    }
    return LocalDataStore.instance;
  }

  public clearAll() {
    this.users = [];
    this.items = [];
    this.suppliers = [];
    this.invoices = [];
    this.purchaseOrders = [];
  }

  public getStats() {
    return {
      usersCount: this.users.length,
      itemsCount: this.items.length,
      suppliersCount: this.suppliers.length,
      invoicesCount: this.invoices.length,
      poCount: this.purchaseOrders.length,
    };
  }
}

export const localStore = LocalDataStore.getInstance();
