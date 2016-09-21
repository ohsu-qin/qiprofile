import { ResourceParams } from 'ng2-resource-rest';

import { RestResource } from '../rest/rest.resource.ts';

@ResourceParams({
    path: '/imaging-collection/{id}'
})

/**
 * The collection REST resource.
 *
 * @class CollectionsResource
 * @extends RestResource
 */
export class CollectionsResource extends RestResource { }
