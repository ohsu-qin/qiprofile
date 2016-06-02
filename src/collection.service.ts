import { Injectable } from '@angular/core';

import { Collection } from './collection.ts';

@Injectable()

export class CollectionService {
  constructor() { }

  private collections: Collection[] = [];

  getCollections() {
    this.collections = [
      new Collection('Breast', 'Breast collection', 'nowhere'),
      new Collection('Sarcoma', 'Sarcoma collection', 'nowhere')
    ];

    return this.collections;
  }
}
