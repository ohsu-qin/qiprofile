import { ResourceParams } from 'ng2-resource-rest';

import { RestResource } from '../common/rest.resource.ts';

@ResourceParams({
    path: '/imaging-collection/{id}'
})

/**
 * The collection REST resource.
 *
 * @module collection
 * @class CollectionResource
 * @extends RestResource
 */
export class CollectionResource extends RestResource {}
